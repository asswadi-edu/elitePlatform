<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = $request->user()->notifications;
        
        return response()->json($notifications);
    }

    public function markAsRead(Request $request, $uuid)
    {
        $notification = $request->user()->notifications()->where('uuid', $uuid)->firstOrFail();
        $notification->update(['read_at' => now()]);
        
        return response()->json(['message' => 'Marked as read']);
    }

    public function markAllAsRead(Request $request)
    {
        $request->user()->notifications()->whereNull('read_at')->update(['read_at' => now()]);
        
        return response()->json(['message' => 'All marked as read']);
    }
}
