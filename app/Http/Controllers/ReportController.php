<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ReportController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'reportable_type' => 'required|string',
            'reportable_id' => 'required',
            'report_type' => 'required|integer',
            'description' => 'nullable|string'
        ]);

        $report = Report::create([
            'uuid' => (string) Str::uuid(),
            'reporter_id' => auth()->id(),
            'reportable_type' => $request->reportable_type,
            'reportable_id' => $request->reportable_id,
            'report_type' => $request->report_type,
            'description' => $request->description,
            'status' => 0 // 0 = pending
        ]);

        $resourceTitle = 'مورد غير معروف';
        if ($request->reportable_type === 'App\\Models\\Resource') {
            $resource = \App\Models\Resource::find($request->reportable_id);
            $resourceTitle = $resource->title ?? $resourceTitle;
        }

        // Notify Reporter
        \App\Models\Notification::create([
            'user_id' => auth()->id(),
            'type' => 'info',
            'data' => [
                'title' => 'إدارة البلاغات',
                'message' => 'لقد قمت بالبلاغ على المورد: "' . $resourceTitle . '". سيتم مراجعته من قبل الإدارة في أقرب وقت.',
            ]
        ]);

        // Notify Owner
        if ($resource && isset($resource->user_id)) {
            \App\Models\Notification::create([
                'user_id' => $resource->user_id,
                'type' => 'info',
                'data' => [
                    'title' => 'إدارة البلاغات',
                    'message' => 'لديك بلاغ على المورد: "' . $resourceTitle . '". سيتم مراجعته من قبل الإدارة قريباً.',
                ]
            ]);
        }

        // Notify Admins and Moderators
        $admins = \App\Models\User::role(['admin', 'moderator'])->get();
        foreach ($admins as $admin) {
            \App\Models\Notification::create([
                'user_id' => $admin->id,
                'type' => 'warning',
                'data' => [
                    'title' => 'إدارة البلاغات',
                    'message' => 'لديك بلاغ جديد على المورد: "' . $resourceTitle . '". يرجى المراجعة واتخاذ الإجراء اللازم.',
                ]
            ]);
        }

        return response()->json([
            'message' => 'تم إرسال البلاغ بنجاح وسيتم مراجعته من قبل الإدارة.',
            'report' => $report
        ], 201);
    }
}
