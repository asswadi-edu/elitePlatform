<?php

namespace App\Http\Controllers;

use App\Models\ActivationCard;
use App\Models\SubscriptionPlan;
use App\Models\UserSubscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AdminSubscriptionController extends Controller
{
    /**
     * Display a listing of user subscriptions.
     */
    public function indexSubscriptions(Request $request)
    {
        $query = UserSubscription::with(['user.profile', 'plan', 'activationCard']);
        
        $filter = $request->query('filter', 'all');
        if ($filter === 'active') {
            $query->where('status', 1);
        } elseif ($filter === 'expired') {
            $query->whereIn('status', [0, 2]);
        }

        $subscriptions = $query->orderBy('id', 'desc')->paginate(20);

        // Add summary data
        $summary = [
            'all' => UserSubscription::count(),
            'active' => UserSubscription::where('status', 1)->count(),
            'expired' => UserSubscription::whereIn('status', [0, 2])->count(),
            'revenue' => UserSubscription::where('status', 1)
                ->join('activation_cards', 'user_subscriptions.activation_card_id', '=', 'activation_cards.id')
                ->sum('activation_cards.price')
        ];

        $responseData = $subscriptions->toArray();
        $responseData['summary'] = $summary;

        return response()->json($responseData);
    }

    /**
     * Display a listing of activation cards.
     */
    public function indexCards(Request $request)
    {
        $query = ActivationCard::with(['plan', 'user.profile']);

        if ($request->has('search')) {
            $search = $request->query('search');
            $query->where(function($q) use ($search) {
                $q->where('full_code', 'like', "%{$search}%")
                  ->orWhere('code_suffix', 'like', "%{$search}%")
                  ->orWhereHas('user', function($qu) use ($search) {
                      $qu->whereHas('profile', function($qp) use ($search) {
                          $qp->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%");
                      });
                  });
            });
        }

        if ($request->has('plan_id') && $request->query('plan_id') !== 'all') {
            $query->where('plan_id', $request->query('plan_id'));
        }

        $paginator = $query->orderBy('id', 'desc')->paginate(20);
        
        // Map to include display code (masked)
        $paginator->getCollection()->transform(function ($card) {
            $card->display_code = $card->full_code ?? ("NKBH-****-****-" . $card->code_suffix);
            return $card;
        });

        // Summary stats
        $summary = [
            'total' => ActivationCard::count(),
            'unused' => ActivationCard::where('is_used', false)->count(),
            'used' => ActivationCard::where('is_used', true)->count(),
            'exported' => ActivationCard::whereNotNull('exported_at')->count(),
        ];

        $responseData = [
            'data' => $paginator->items(),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'total' => $paginator->total(),
            'summary' => $summary
        ];

        return response()->json($responseData);
    }

    /**
     * Store a batch of activation cards.
     */
    public function storeCards(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'plan_id' => 'required|exists:subscription_plans,id',
            'count' => 'required|integer|min:1|max:1000',
            'price' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $plan = SubscriptionPlan::find($request->plan_id);
        $batchId = time();
        $count = $request->count;
        $price = $request->price ?? $plan->price;
        $generatedBy = $request->user()->id;

        $generatedCards = [];
        $plainCodes = [];

        for ($i = 0; $i < $count; $i++) {
            $code = $this->generateCode();
            $plainCodes[] = $code;

            $card = ActivationCard::create([
                'code_hash' => hash('sha256', str_replace('-', '', $code)),
                'full_code' => $code,
                'code_suffix' => substr($code, -4),
                'plan_id' => $plan->id,
                'price' => $price,
                'batch_id' => $batchId,
                'generated_by' => $generatedBy,
                'is_used' => false,
            ]);

            $generatedCards[] = $card->load('plan');
        }

        return response()->json([
            'cards' => $generatedCards,
            'plain_codes' => $plainCodes // Return only once
        ], 201);
    }

    /**
     * Display a listing of subscription plans.
     */
    public function indexPlans()
    {
        return response()->json(SubscriptionPlan::where('is_active', true)->get());
    }

    /**
     * Remove the specified card.
     */
    public function deleteCard($id)
    {
        $card = ActivationCard::findOrFail($id);
        if ($card->is_used) {
            return response()->json(['message' => 'Cannot delete used card'], 422);
        }
        $card->delete();
        return response()->json(['message' => 'Card deleted successfully']);
    }

    /**
     * Cancel a user subscription.
     */
    public function cancelSubscription($id)
    {
        $subscription = UserSubscription::findOrFail($id);
        $subscription->update(['status' => 2]); // 2 = cancelled
        return response()->json($subscription->load(['user', 'plan']));
    }

    /**
     * Renew/Activate a user subscription.
     */
    public function renewSubscription($id)
    {
        $subscription = UserSubscription::findOrFail($id);
        $subscription->update(['status' => 1]); // 1 = active
        return response()->json($subscription->load(['user', 'plan']));
    }

    /**
     * Store a new subscription plan
     */
    public function storePlan(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'price' => 'required|numeric|min:0',
            'duration_days' => 'required|integer|min:1',
            'color_hex' => 'required|string|max:10',
            'max_ai_tests' => 'required|integer|min:0',
        ]);

        $plan = SubscriptionPlan::create([
            'name' => $request->name,
            'price' => $request->price,
            'duration_days' => $request->duration_days,
            'color_hex' => $request->color_hex,
            'max_ai_tests' => $request->max_ai_tests,
            'is_active' => true
        ]);

        return response()->json($plan);
    }

    /**
     * Update an existing subscription plan
     */
    public function updatePlan(Request $request, $id)
    {
        $plan = SubscriptionPlan::findOrFail($id);
        $request->validate([
            'name' => 'required|string|max:100',
            'price' => 'required|numeric|min:0',
            'duration_days' => 'required|integer|min:1',
            'color_hex' => 'required|string|max:10',
            'max_ai_tests' => 'required|integer|min:0',
        ]);

        $plan->update($request->all());
        return response()->json($plan);
    }

    /**
     * Delete a subscription plan
     */
    public function deletePlan($id)
    {
        $plan = SubscriptionPlan::findOrFail($id);
        
        // Check if there are active subscriptions using this plan
        if (\App\Models\UserSubscription::where('plan_id', $id)->where('status', 1)->exists()) {
            return response()->json(['message' => 'لا يمكن حذف خطة مرتبطة باشتراكات نشطة.'], 422);
        }

        $plan->delete();
        return response()->json(['message' => 'تم حذف الخطة بنجاح.']);
    }

    /**
     * Export unactivated, unexported cards for printing.
     */
    public function exportCards(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'plan_id' => 'required|exists:subscription_plans,id',
            'count' => 'required|integer|min:1|max:5000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $cards = ActivationCard::with('plan')
            ->where('plan_id', $request->plan_id)
            ->where('is_used', false)
            ->whereNull('exported_at')
            ->limit($request->count)
            ->get();

        if ($cards->isEmpty()) {
            return response()->json(['message' => 'لا توجد بطاقات غير مسحوبة لهذه الخطة حالياً.'], 404);
        }

        // Mark as exported
        $now = now();
        ActivationCard::whereIn('id', $cards->pluck('id'))->update(['exported_at' => $now]);

        $exportData = $cards->map(function ($card) {
            return [
                'code' => $card->full_code,
                'plan_name' => $card->plan->name,
                'price' => $card->price,
                'duration' => $card->plan->duration_days,
            ];
        });

        return response()->json($exportData);
    }

    /**
     * Helper to generate NKBH-XXXX-XXXX-XXXX code
     */
    private function generateCode()
    {
        $chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        $parts = [];
        for ($i = 0; $i < 3; $i++) {
            $part = "";
            for ($j = 0; $j < 4; $j++) {
                $part .= $chars[rand(0, strlen($chars) - 1)];
            }
            $parts[] = $part;
        }
        return "NKBH-" . implode("-", $parts);
    }
}
