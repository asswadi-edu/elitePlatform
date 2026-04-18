<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckMaintenanceMode
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Allowed routes during maintenance (even for non-admins to avoid breaking settings fetch/login/admin control)
        if ($request->is('api/settings', 'api/login', 'api/me', 'api/logout', 'api/admin/*', 'api/moderator/*')) {
            return $next($request);
        }

        $maintenance = \App\Models\SystemSetting::where('key', 'maintenance_mode')->first();
        $isMaintenance = $maintenance && ($maintenance->value === '1' || $maintenance->value === 'true');

        if ($isMaintenance) {
            $user = $request->user();
            // If not logged in or not an admin, block access
            if (!$user || $user->role !== 'admin') {
                return response()->json([
                    'message' => 'المنصة حالياً في وضع الصيانة. يرجى المحاولة لاحقاً.',
                    'maintenance' => true
                ], 503);
            }
        }

        return $next($request);
    }
}
