<?php

namespace App\Http\Controllers;

use App\Models\University;
use App\Models\Field;
use App\Models\College;
use App\Models\Major;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class AdminAcademicController extends Controller
{
    /**
     * Display a listing of universities.
     */
    public function indexUniversities()
    {
        return response()->json(University::orderBy('id', 'desc')->paginate(20));
    }

    /**
     * Store a newly created university.
     */
    public function storeUniversity(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:191|unique:universities,name',
            'type' => 'required|integer|in:1,2,3',
            'city' => 'nullable|string|max:100',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $university = University::create([
            'name' => $request->name,
            'type' => $request->type,
            'city' => $request->city,
            'is_active' => $request->is_active ?? true,
        ]);

        return response()->json($university, 201);
    }

    /**
     * Update the specified university.
     */
    public function updateUniversity(Request $request, $id)
    {
        $university = University::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'required', 'string', 'max:191', Rule::unique('universities')->ignore($id)],
            'type' => 'sometimes|required|integer|in:1,2,3',
            'city' => 'nullable|string|max:100',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $university->update($request->only(['name', 'type', 'city', 'is_active']));

        return response()->json($university);
    }

    /**
     * Remove the specified university.
     */
    public function deleteUniversity($id)
    {
        $university = University::findOrFail($id);
        $university->delete();

        return response()->json(['message' => 'University deleted successfully']);
    }

    /**
     * Display a listing of fields.
     */
    public function indexFields()
    {
        return response()->json(Field::withCount('majors')->orderBy('display_order')->orderBy('id', 'desc')->paginate(20));
    }

    /**
     * Store a newly created field.
     */
    public function storeField(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:191|unique:fields,name',
            'icon_key' => 'nullable|string|max:50',
            'color_hex' => 'nullable|string|max:10',
            'description' => 'nullable|string',
            'display_order' => 'integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $field = Field::create($request->all());

        return response()->json($field, 201);
    }

    /**
     * Update the specified field.
     */
    public function updateField(Request $request, $id)
    {
        $field = Field::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'required', 'string', 'max:191', Rule::unique('fields')->ignore($id)],
            'icon_key' => 'nullable|string|max:50',
            'color_hex' => 'nullable|string|max:10',
            'description' => 'nullable|string',
            'display_order' => 'integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $field->update($request->all());

        return response()->json($field);
    }

    /**
     * Remove the specified field.
     */
    public function deleteField($id)
    {
        $field = Field::findOrFail($id);
        $field->delete();

        return response()->json(['message' => 'Field deleted successfully']);
    }

    /**
     * Display a listing of colleges.
     */
    public function indexColleges()
    {
        return response()->json(College::with(['field'])->orderBy('id', 'desc')->paginate(20));
    }

    /**
     * Store a newly created college.
     */
    public function storeCollege(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:191|unique:colleges,name',

            'field_id' => 'nullable|exists:fields,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $college = College::create($request->all());
        return response()->json($college->load(['field']), 201);
    }

    /**
     * Update the specified college.
     */
    public function updateCollege(Request $request, $id)
    {
        $college = College::findOrFail($id);
        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'required', 'string', 'max:191', Rule::unique('colleges')->ignore($id)],

            'field_id' => 'nullable|exists:fields,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $college->update($request->all());
        return response()->json($college->load(['field']));
    }

    /**
     * Remove the specified college.
     */
    public function deleteCollege($id)
    {
        $college = College::findOrFail($id);
        $college->delete();
        return response()->json(['message' => 'College deleted successfully']);
    }

    /**
     * Display a listing of majors.
     */
    public function indexMajors()
    {
        return response()->json(Major::with(['college', 'field'])->orderBy('id', 'desc')->paginate(20));
    }

    /**
     * Store a newly created major.
     */
    public function storeMajor(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => [
                'required', 'string', 'max:191',
                Rule::unique('majors')->where(function ($query) use ($request) {
                    return $query->where('college_id', $request->college_id);
                })
            ],
            'college_id' => 'nullable|exists:colleges,id',
            'field_id' => 'nullable|exists:fields,id',
            'description' => 'nullable|string',
            'job_title' => 'nullable|array',
            'image_url' => 'nullable|string|max:500',
            'careers' => 'nullable|array',
            'core_subjects' => 'nullable|array',
            'required_skills' => 'nullable|array',
            'duration' => 'nullable|string|max:50',
            'degree_type' => 'nullable|string|max:100',
            'study_nature' => 'nullable|string|max:100',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $major = Major::create($request->all());
        return response()->json($major->load(['college', 'field']), 201);
    }

    /**
     * Update the specified major.
     */
    public function updateMajor(Request $request, $id)
    {
        $major = Major::findOrFail($id);
        $validator = Validator::make($request->all(), [
            'name' => [
                'sometimes', 'required', 'string', 'max:191',
                Rule::unique('majors')->where(function ($query) use ($request) {
                    return $query->where('college_id', $request->college_id);
                })->ignore($id)
            ],
            'college_id' => 'nullable|exists:colleges,id',
            'field_id' => 'nullable|exists:fields,id',
            'description' => 'nullable|string',
            'job_title' => 'nullable|array',
            'image_url' => 'nullable|string|max:500',
            'careers' => 'nullable|array',
            'core_subjects' => 'nullable|array',
            'required_skills' => 'nullable|array',
            'duration' => 'nullable|string|max:50',
            'degree_type' => 'nullable|string|max:100',
            'study_nature' => 'nullable|string|max:100',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $major->update($request->all());
        return response()->json($major->load(['college', 'field']));
    }

    /**
     * Remove the specified major.
     */
    public function deleteMajor($id)
    {
        $major = Major::findOrFail($id);
        $major->delete();
        return response()->json(['message' => 'Major deleted successfully']);
    }

    /**
     * Display a listing of subjects.
     */
    public function indexSubjects()
    {
        return response()->json(Subject::with('major')->orderBy('id', 'desc')->paginate(20));
    }

    /**
     * Store a newly created subject.
     */
    public function storeSubject(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => [
                'required', 'string', 'max:191',
                Rule::unique('subjects')->where(function ($query) use ($request) {
                    return $query->where('major_id', $request->major_id);
                })
            ],
            'code' => [
                'required', 'string', 'max:20',
                Rule::unique('subjects')->where(function ($query) use ($request) {
                    return $query->where('major_id', $request->major_id);
                })
            ],
            'major_id' => 'required|exists:majors,id',
            'is_free' => 'boolean',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $subject = Subject::create($request->all());
        return response()->json($subject->load('major'), 201);
    }

    /**
     * Update the specified subject.
     */
    public function updateSubject(Request $request, $id)
    {
        $subject = Subject::findOrFail($id);
        $validator = Validator::make($request->all(), [
            'name' => [
                'sometimes', 'required', 'string', 'max:191',
                Rule::unique('subjects')->where(function ($query) use ($request) {
                    return $query->where('major_id', $request->major_id);
                })->ignore($id)
            ],
            'code' => [
                'sometimes', 'required', 'string', 'max:20',
                Rule::unique('subjects')->where(function ($query) use ($request) {
                    return $query->where('major_id', $request->major_id);
                })->ignore($id)
            ],
            'major_id' => 'sometimes|required|exists:majors,id',
            'is_free' => 'boolean',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $subject->update($request->all());
        return response()->json($subject->load('major'));
    }

    /**
     * Remove the specified subject.
     */
    public function deleteSubject($id)
    {
        $subject = Subject::findOrFail($id);
        $subject->delete();
        return response()->json(['message' => 'Subject deleted successfully']);
    }

    /**
     * Upload an image for a major.
     */
    public function uploadMajorImage(Request $request, $id)
    {
        $major = Major::findOrFail($id);
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $imageName = time() . '_' . $id . '.' . $request->image->extension();
            $request->image->move(public_path('uploads/majors'), $imageName);
            
            $major->image_url = url('uploads/majors/' . $imageName);
            $major->save();

            return response()->json([
                'image_url' => $major->image_url,
                'major' => $major
            ]);
        }

        return response()->json(['message' => 'No image uploaded'], 400);
    }
}
