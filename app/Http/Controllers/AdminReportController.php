<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminReportController extends Controller
{
    public function index(Request $request)
    {
        $query = Report::with(['reporter.profile', 'reportable']);

        if ($request->has('status') && $request->status !== 'all') {
            $status = $request->status;
            // Handle numeric status or string mapping
            if (is_numeric($status)) {
                $query->where('status', (int)$status);
            } else {
                $map = ['pending' => 0, 'reviewed' => 1, 'resolved' => 2, 'dismissed' => 3];
                if (isset($map[$status])) $query->where('status', $map[$status]);
            }
        } else {
            // Default to pending if no status provided
            $query->where('status', 0);
        }

        $reports = $query->latest()->paginate(20);
        return response()->json($reports);
    }

    public function resolve(Request $request, $id)
    {
        $report = Report::with(['reportable', 'reporter'])->findOrFail($id);
        $resourceTitle = $report->reportable->title ?? 'مورد غير معروف';

        // Notify Owner (if exists and is a resource)
        if ($report->reportable && isset($report->reportable->user_id)) {
            Notification::create([
                'user_id' => $report->reportable->user_id,
                'type' => 'warning',
                'data' => [
                    'title' => 'إدارة البلاغات',
                    'message' => 'لقد تم قبول البلاغ على المورد: "' . $resourceTitle . '". تم اتخاذ إجراء إداري بحذف المحتوى لمخالفته السياسات.',
                ]
            ]);
        }

        // Notify Reporter
        Notification::create([
            'user_id' => $report->reporter_id,
            'type' => 'success',
            'data' => [
                'title' => 'إدارة البلاغات',
                'message' => 'لقد تم قبول بلاغك على المورد: "' . $resourceTitle . '". تم حذف المحتوى، شكراً لك.',
            ]
        ]);

        // If the admin chose to resolve and it's a resource to be deleted
        if ($request->delete_content && $report->reportable) {
            $report->reportable->delete();
        }

        $report->update([
            'status' => 2, // 2 = resolved
            'resolved_by' => Auth::id(),
            'resolved_at' => now(),
            'resolution_note' => $request->resolution_note ?? 'Resolved by admin'
        ]);

        return response()->json($report->load(['reporter.profile', 'reportable']));
    }

    public function dismiss($id)
    {
        $report = Report::with(['reportable', 'reporter'])->findOrFail($id);
        $resourceTitle = $report->reportable->title ?? 'مورد غير معروف';
        
        // Notify Owner
        if ($report->reportable && isset($report->reportable->user_id)) {
            Notification::create([
                'user_id' => $report->reportable->user_id,
                'type' => 'info',
                'data' => [
                    'title' => 'إدارة البلاغات',
                    'message' => 'لقد تم رفض البلاغ المقدم ضد موردك: "' . $resourceTitle . '". المورد سيبقى متاحاً للجميع.',
                ]
            ]);
        }

        // Notify Reporter
        Notification::create([
            'user_id' => $report->reporter_id,
            'type' => 'info',
            'data' => [
                'title' => 'إدارة البلاغات',
                'message' => 'لقد تم رفض البلاغ على المورد: "' . $resourceTitle . '". بعد المراجعة اليدوية لم يتبين لنا وجود مخالفة.',
            ]
        ]);

        $report->update([
            'status' => 3, // 3 = dismissed
            'resolved_by' => Auth::id(),
            'resolved_at' => now()
        ]);

        return response()->json($report->load(['reporter.profile', 'reportable']));
    }
}
