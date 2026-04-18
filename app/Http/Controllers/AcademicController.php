<?php

namespace App\Http\Controllers;

use App\Models\University;
use App\Models\College;
use App\Models\Field;
use App\Models\Major;
use Illuminate\Http\Request;

class AcademicController extends Controller
{
    public function universities()
    {
        return response()->json(University::all());
    }

    public function colleges(Request $request)
    {
        $query = College::query();

        return response()->json($query->get());
    }

    public function fields()
    {
        return response()->json(Field::orderBy('display_order')->get());
    }

    public function majors(Request $request)
    {
        $query = Major::with(['field', 'college'])->where('is_active', true);
        if ($request->has('field_id')) {
            $query->where('field_id', $request->field_id);
        }
        if ($request->has('college_id')) {
            $query->where('college_id', $request->college_id);
        }
        return response()->json($query->orderBy('id', 'desc')->get());
    }
}
