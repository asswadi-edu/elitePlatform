<?php

namespace App\Http\Controllers;

use App\Models\Suggestion;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SuggestionController extends Controller
{
    /**
     * Display a listing of my suggestions.
     */
    public function index(Request $request)
    {
        $suggestions = Suggestion::where('user_id', $request->user()->id)
            ->latest()
            ->paginate(10);
            
        return response()->json($suggestions);
    }

    /**
     * Store a new suggestion.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'nullable|integer',
        ]);

        $suggestion = Suggestion::create([
            'uuid' => (string) Str::uuid(),
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'description' => $request->description,
            'category' => $request->category ?? 4, // 4 = Other
            'status' => 0, // 0 = New/Pending
        ]);

        return response()->json([
            'message' => 'تم استلام اقتراحك بنجاح. شكراً لمساهمتك في تطوير المنصة!',
            'suggestion' => $suggestion
        ], 201);
    }
}
