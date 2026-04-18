<?php

namespace App\Http\Controllers;

use App\Models\Suggestion;
use Illuminate\Http\Request;

class AdminSuggestionController extends Controller
{
    /**
     * Display a listing of all suggestions.
     */
    public function index(Request $request)
    {
        $query = Suggestion::with('user.profile');

        if ($request->has('status')) {
            $query->where('status', (int)$request->status);
        }

        $suggestions = $query->latest()->paginate(20);
        
        return response()->json($suggestions);
    }

    /**
     * Update the status of a suggestion.
     */
    public function markAsReviewed($id)
    {
        $suggestion = Suggestion::findOrFail($id);
        $suggestion->update(['status' => 1]); // 1 = Reviewed

        return response()->json(['message' => 'تم تحديد الاقتراح كمقروء/تمت مراجعته.']);
    }

    /**
     * Remove the specified suggestion.
     */
    public function destroy($id)
    {
        $suggestion = Suggestion::findOrFail($id);
        $suggestion->delete();

        return response()->json(['message' => 'تم حذف الاقتراح بنجاح.']);
    }
}
