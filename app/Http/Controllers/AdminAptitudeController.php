<?php

namespace App\Http\Controllers;

use App\Models\AptitudeTest;
use App\Models\AptitudeQuestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminAptitudeController extends Controller
{
    /**
     * Get all questions for the current active test.
     */
    public function indexQuestions()
    {
        $test = AptitudeTest::firstOrCreate(['version' => '1.0'], ['is_active' => true]);
        
        $questions = AptitudeQuestion::where('test_id', $test->id)
            ->orderBy('display_order')
            ->orderBy('id', 'desc')
            ->paginate(20);

        $maxAttempts = \App\Models\SystemSetting::where('key', 'aptitude_max_attempts')->value('value') ?? 1;
        $canDeleteResults = \App\Models\SystemSetting::where('key', 'aptitude_can_delete_results')->value('value') ?? true;

        return response()->json([
            'test' => $test,
            'max_attempts' => (int) $maxAttempts,
            'can_delete_results' => (bool) $canDeleteResults,
            'questions' => $questions
        ]);
    }

    /**
     * Store a new question.
     */
    public function storeQuestion(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'question_text' => 'required|string',
            'display_order' => 'integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $test = AptitudeTest::firstOrCreate(['is_active' => true], ['version' => '1.0']);

        $question = AptitudeQuestion::create([
            'test_id' => $test->id,
            'question_text' => $request->question_text,
            'display_order' => $request->display_order ?? 0,
        ]);

        return response()->json($question, 201);
    }

    /**
     * Update an existing question.
     */
    public function updateQuestion(Request $request, $id)
    {
        $question = AptitudeQuestion::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'question_text' => 'sometimes|required|string',
            'display_order' => 'sometimes|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $question->update($request->only(['question_text', 'display_order']));

        return response()->json($question);
    }

    /**
     * Delete a question.
     */
    public function deleteQuestion($id)
    {
        $question = AptitudeQuestion::findOrFail($id);
        $question->delete();

        return response()->json(['message' => 'Question deleted successfully']);
    }

    /**
     * Update test settings including time limit and status.
     */
    public function updateSettings(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'is_active' => 'sometimes|boolean',
            'time_limit' => 'nullable|integer|min:0',
            'max_attempts' => 'sometimes|integer|min:1',
            'can_delete_results' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $test = AptitudeTest::firstOrCreate(['version' => '1.0']);
        $test->update($request->only(['is_active', 'time_limit']));

        if ($request->has('max_attempts')) {
            \App\Models\SystemSetting::updateOrCreate(
                ['key' => 'aptitude_max_attempts'],
                ['value' => $request->max_attempts, 'type' => 'integer']
            );
        }

        if ($request->has('can_delete_results')) {
            \App\Models\SystemSetting::updateOrCreate(
                ['key' => 'aptitude_can_delete_results'],
                ['value' => $request->can_delete_results, 'type' => 'boolean']
            );
        }

        return response()->json($test);
    }
}
