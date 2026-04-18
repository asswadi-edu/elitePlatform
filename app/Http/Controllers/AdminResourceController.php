<?php

namespace App\Http\Controllers;

use App\Models\Resource;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminResourceController extends Controller
{
    public function index(Request $request)
    {
        $query = Resource::with(['user.profile', 'subject']);

        if ($request->has('status') && $request->status !== 'all') {
            $status = $request->status;
            if ($status === 'pending') $query->where('is_approved', false);
            elseif ($status === 'approved') $query->where('is_approved', true);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%$search%")
                  ->orWhereHas('user.profile', function($qu) use ($search) {
                      $qu->where('first_name', 'like', "%$search%")
                        ->orWhere('last_name', 'like', "%$search%");
                  })
                  ->orWhereHas('subject', function($qs) use ($search) {
                      $qs->where('name', 'like', "%$search%");
                  });
            });
        }

        $resources = $query->latest()->paginate(20);
        return response()->json($resources);
    }

    public function approve($id)
    {
        $resource = Resource::findOrFail($id);
        $resource->update([
            'is_approved' => true,
            'approved_by' => Auth::id(),
            'approved_at' => now()
        ]);

        // Notify User
        $notification = new Notification();
        $notification->user_id = $resource->user_id;
        $notification->type = 'resource_approved';
        $notification->data = [
            'title' => 'تم قبول موردك',
            'message' => "تمت الموافقة على المورد: {$resource->title} وهو الآن متاح للجميع.",
            'resource_id' => $resource->id
        ];
        $notification->notifiable_type = Resource::class;
        $notification->notifiable_id = $resource->id;
        $notification->created_at = now();
        $notification->save();

        return response()->json($resource->load(['user', 'subject']));
    }

    public function reject($id)
    {
        $resource = Resource::findOrFail($id);
        $resource->update([
            'is_approved' => false,
            'approved_by' => Auth::id(),
            'approved_at' => null
        ]);

        // Notify User
        $notification = new Notification();
        $notification->user_id = $resource->user_id;
        $notification->type = 'resource_rejected';
        $notification->data = [
            'title' => 'تم رفض موردك',
            'message' => "للأسف، تعذر قبول المورد: {$resource->title}. يرجى مراجعته أو التواصل مع الإدارة.",
            'resource_id' => $resource->id
        ];
        $notification->notifiable_type = Resource::class;
        $notification->notifiable_id = $resource->id;
        $notification->created_at = now();
        $notification->save();

        return response()->json($resource->load(['user', 'subject']));
    }

    public function destroy($id)
    {
        $resource = Resource::findOrFail($id);
        
        // Notify User BEFORE deleting
        $notification = new Notification();
        $notification->user_id = $resource->user_id;
        $notification->type = 'resource_deleted';
        $notification->data = [
            'title' => 'تم حذف موردك',
            'message' => "تم حذف المورد: {$resource->title} من قبل الإدارة.",
            'resource_id' => $resource->id
        ];
        $notification->notifiable_type = Resource::class;
        $notification->notifiable_id = $resource->id;
        $notification->created_at = now();
        $notification->save();

        $resource->delete();
        return response()->json(['message' => 'Resource deleted successfully']);
    }
}
