<?php

namespace App\Http\Controllers;

use App\Models\ActivationCard;
use App\Models\SubscriptionPlan;
use App\Models\UserSubscription;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class SubscriptionController extends Controller
{
    /**
     * Activate a subscription using a card code.
     */
    public function activateCard(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Invalid code format'], 422);
        }

        $codeRaw = strtoupper($request->code); // Expected "NKBH-XXXX-XXXX-XXXX"
        $codeNoHyphens = str_replace('-', '', $codeRaw);
        
        $hashNoHyphens = hash('sha256', $codeNoHyphens);
        $hashWithHyphens = hash('sha256', $codeRaw);

        $card = ActivationCard::where(function($q) use ($hashNoHyphens, $hashWithHyphens) {
                $q->where('code_hash', $hashNoHyphens)
                  ->orWhere('code_hash', $hashWithHyphens);
            })
            ->where('is_used', false)
            ->with('plan')
            ->first();

        if (!$card) {
            return response()->json(['message' => 'Invalid or already used activation code'], 422);
        }

        if ($card->expires_at && $card->expires_at->isPast()) {
            return response()->json(['message' => 'This activation card has expired'], 422);
        }

        $user = $request->user();
        $plan = $card->plan;

        DB::beginTransaction();
        try {
            // Update card status
            $card->update([
                'is_used' => true,
                'used_by' => $user->id,
                'used_at' => now(),
            ]);

            // Deactivate any currently active subscriptions for this user
            UserSubscription::where('user_id', $user->id)
                ->where('status', 1)
                ->update(['status' => 0]); // 0 = expired/inactive

            // Create new subscription
            $startsAt = now();
            $endsAt = $startsAt->copy()->addDays($plan->duration_days);

            $subscription = UserSubscription::create([
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'activation_card_id' => $card->id,
                'status' => 1, // Active
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
                'activated_by' => 'card',
            ]);

            $user->assignRole('subscriber');

            DB::commit();

            return response()->json([
                'message' => 'Subscription activated successfully',
                'plan_name' => $plan->name,
                'expires_at' => $endsAt->toDateString(),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to activate subscription', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get the current user's subscription status.
     */
    public function status(Request $request)
    {
        $subscription = UserSubscription::where('user_id', $request->user()->id)
            ->where('status', 1)
            ->with(['plan', 'activationCard'])
            ->first();

        return response()->json([
            'is_subscribed' => (bool)$subscription,
            'subscription' => $subscription,
        ]);
    }

    /**
     * Get available subscription plans.
     */
    public function plans()
    {
        return response()->json(SubscriptionPlan::where('is_active', true)->get());
    }
}
