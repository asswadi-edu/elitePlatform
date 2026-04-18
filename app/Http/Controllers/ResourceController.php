<?php

namespace App\Http\Controllers;

use App\Models\Resource;
use App\Models\Subject;
use App\Models\ResourceLike;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ResourceController extends Controller
{
    /**
     * Get resources for a specific subject (Student view).
     */
    public function index(Request $request)
    {
        $query = Resource::with(['user.profile', 'subject']);

        if ($request->has('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        if ($request->has('status')) {
            if ($request->status === 'approved') {
                $query->where('is_approved', true);
            }
        }

        $resources = $query->latest()->get();

        return response()->json($resources);
    }

    /**
     * Get resources uploaded by the current student.
     */
    public function getMyResources(Request $request)
    {
        $user = $request->user();
        $resources = Resource::with('subject')
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        return response()->json($resources);
    }

    /**
     * Store a new resource.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'subject_id' => 'required|exists:subjects,id',
            'resource_type' => 'required', 
            'file' => 'required_if:resource_type,1|file|max:10240', 
            'is_anonymous' => 'boolean',
            'description' => 'nullable|string',
            'doctor' => 'nullable|string',
            'platform' => 'nullable|string|max:100',
            'duration' => 'nullable|string|max:50',
            'file_url' => 'required_if:resource_type,2|string|nullable'
        ]);

        $user = $request->user();

        if (!$user->can('upload_resources')) {
            return response()->json(['message' => 'غير مصرح لك برفع الموارد.'], 403);
        }

        $file = $request->file('file');
        
        $data = [
            'uuid' => (string) Str::uuid(),
            'title' => $request->title,
            'description' => $request->description,
            'subject_id' => $request->subject_id,
            'user_id' => $user->id,
            'resource_type' => $request->resource_type,
            'is_anonymous' => $request->is_anonymous ?? false,
            'is_approved' => false,
            'doctor' => $request->doctor,
            'platform' => $request->platform,
            'duration' => $request->duration,
        ];

        if ($file) {
            $path = $file->store('resources', 'public');
            $data['file_url'] = Storage::url($path);
            $data['file_name'] = $file->getClientOriginalName();
            $data['file_size'] = $file->getSize();
            $data['mime_type'] = $file->getMimeType();
        } else {
            $data['file_url'] = $request->file_url;
            $data['file_name'] = $request->title;
            $data['file_size'] = 0;
            $data['mime_type'] = 'text/html';
        }

        $resource = Resource::create($data);

        return response()->json([
            'message' => 'تم رفع المورد بنجاح، وهو بانتظار مراجعة الإدارة.',
            'resource' => $resource
        ], 201);
    }
    /**
     * Like a resource.
     */
    public function like($id)
    {
        $user = auth()->user();
        $resource = Resource::findOrFail($id);
        
        $like = ResourceLike::where('user_id', $user->id)
            ->where('resource_id', $resource->id)
            ->first();

        $likesPerPoint = (int)\App\Services\PointService::getRule('likes_per_point', 10);
        $authorId = $resource->user_id;

        if ($like) {
            // Unlike logic
            if ($resource->likes_count > 0 && $resource->likes_count % $likesPerPoint === 0) {
                \App\Services\PointService::deductPoints($authorId, 1);
            }
            $like->delete();
            $resource->decrement('likes_count');
            $liked = false;
        } else {
            // Like logic
            $resource->increment('likes_count');
            if ($resource->likes_count % $likesPerPoint === 0) {
                \App\Services\PointService::awardPoints($authorId, 1, "إعجاب على المورد: {$resource->title}");
            }
            ResourceLike::create([
                'user_id' => $user->id,
                'resource_id' => $resource->id
            ]);
            $liked = true;
        }
        
        return response()->json([
            'likes' => $resource->likes_count,
            'liked' => $liked
        ]);
    }

    /**
     * Dislike a resource.
     */
    public function dislike($id)
    {
        $resource = Resource::findOrFail($id);
        $resource->increment('dislikes_count');
        return response()->json(['dislikes' => $resource->dislikes_count]);
    }

    /**
     * Increment download count.
     */
    public function download($id)
    {
        $resource = Resource::findOrFail($id);
        if ($resource->resource_type == 2) {
            $resource->increment('clicks');
            return response()->json(['clicks' => $resource->clicks]);
        }
        $resource->increment('downloads_count');
        return response()->json(['downloads' => $resource->downloads_count]);
    }

    /**
     * View/Stream the resource file.
     */
    public function viewFile($uuid)
    {
        $resource = Resource::where('uuid', $uuid)->firstOrFail();
        
        // Remove '/storage/' from the beginning of file_url if it exists
        $path = str_replace('/storage/', '', $resource->file_url);
        
        if (!Storage::disk('public')->exists($path)) {
            abort(404, 'الملف غير موجود');
        }

        return Storage::disk('public')->response($path);
    }

    private function formatSizeUnits($bytes)
    {
        if ($bytes >= 1073741824) {
            $bytes = number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            $bytes = number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            $bytes = number_format($bytes / 1024, 2) . ' KB';
        } elseif ($bytes > 1) {
            $bytes = $bytes . ' bytes';
        } elseif ($bytes == 1) {
            $bytes = $bytes . ' byte';
        } else {
            $bytes = '0 bytes';
        }

        return $bytes;
    }
}
