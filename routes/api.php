<?php

use App\Http\Controllers\AcademicController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\ResourceController;
use App\Http\Controllers\SuggestionController;
use App\Http\Controllers\AdminSuggestionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AdminAcademicController;
use App\Http\Controllers\AdminSubscriptionController;
use App\Http\Controllers\SystemSettingController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\LogController;
use App\Http\Controllers\AdminResourceController;
use App\Http\Controllers\AdminReportController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\AptitudeController;
use App\Http\Controllers\AdminAptitudeController;
use App\Http\Controllers\ChallengeController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register/verify', [AuthController::class, 'finalizeRegistration']);
Route::post('/password/forgot', [AuthController::class, 'forgotPassword']);
Route::post('/password/verify-code', [AuthController::class, 'verifyResetCode']);
Route::post('/password/reset', [AuthController::class, 'resetPassword']);




Route::get('/universities', [AcademicController::class, 'universities']);
Route::get('/colleges', [AcademicController::class, 'colleges']);
Route::get('/fields', [AcademicController::class, 'fields']);
Route::get('/majors', [AcademicController::class, 'majors']);
Route::get('/resources/view/{uuid}', [ResourceController::class, 'viewFile']);

// Protected routes
// --- System Settings (Public) ---
Route::get('/settings', [SystemSettingController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/email/verify-otp', [AuthController::class, 'verifyEmailOTP']);
    Route::post('/email/verification-notification', [AuthController::class, 'resendVerification']);
    
    // Profile management
    Route::post('/profile/update', [ProfileController::class, 'update']);
    Route::post('/profile/university-update', [ProfileController::class, 'updateUniversityInfo']);
    Route::post('/profile/upload-avatar', [ProfileController::class, 'uploadAvatar']);
    Route::post('/profile/delete-avatar', [ProfileController::class, 'deleteAvatar']);

    // Course Enrollment
    Route::get('/my-courses', [CourseController::class, 'getMyCourses']);
    Route::get('/available-courses', [CourseController::class, 'getAvailableCourses']);
    Route::post('/enroll-subjects', [CourseController::class, 'enrollSubjects']);

    // Student Resources (Contributions)
    Route::get('/my-resources', [ResourceController::class, 'getMyResources']);
    Route::post('/resources', [ResourceController::class, 'store']);
    Route::post('/resources/{id}/like', [ResourceController::class, 'like']);
    Route::post('/resources/{id}/dislike', [ResourceController::class, 'dislike']);
    Route::post('/resources/{id}/download', [ResourceController::class, 'download']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::post('/notifications/{uuid}/read', [NotificationController::class, 'markAsRead']);
    
    // Admin routes
    Route::middleware('role:admin|moderator')->group(function () {
        Route::get('/admin/users', [UserController::class, 'index']);
        Route::post('/admin/users', [UserController::class, 'store']);
        Route::post('/admin/users/{id}/toggle-status', [UserController::class, 'toggleStatus']);
        Route::post('/admin/users/{id}/change-role', [UserController::class, 'changeRole']);
        Route::post('/admin/users/{id}/adjust-points', [UserController::class, 'adjustPoints']);
        Route::post('/admin/users/{id}/toggle-trust', [UserController::class, 'toggleTrust']);
        Route::post('/admin/users/{id}/notify', [UserController::class, 'notifyUser']);

        // Admin Academic
        Route::get('/admin/academic/universities', [AdminAcademicController::class, 'indexUniversities']);
        Route::post('/admin/academic/universities', [AdminAcademicController::class, 'storeUniversity']);
        Route::put('/admin/academic/universities/{id}', [AdminAcademicController::class, 'updateUniversity']);
        Route::delete('/admin/academic/universities/{id}', [AdminAcademicController::class, 'deleteUniversity']);

        Route::get('/admin/academic/fields', [AdminAcademicController::class, 'indexFields']);
        Route::post('/admin/academic/fields', [AdminAcademicController::class, 'storeField']);
        Route::put('/admin/academic/fields/{id}', [AdminAcademicController::class, 'updateField']);
        Route::delete('/admin/academic/fields/{id}', [AdminAcademicController::class, 'deleteField']);

        Route::get('/admin/academic/colleges', [AdminAcademicController::class, 'indexColleges']);
        Route::post('/admin/academic/colleges', [AdminAcademicController::class, 'storeCollege']);
        Route::put('/admin/academic/colleges/{id}', [AdminAcademicController::class, 'updateCollege']);
        Route::delete('/admin/academic/colleges/{id}', [AdminAcademicController::class, 'deleteCollege']);

        Route::get('/admin/academic/majors', [AdminAcademicController::class, 'indexMajors']);
        Route::post('/admin/academic/majors', [AdminAcademicController::class, 'storeMajor']);
        Route::put('/admin/academic/majors/{id}', [AdminAcademicController::class, 'updateMajor']);
        Route::post('/admin/academic/majors/{id}/upload-image', [AdminAcademicController::class, 'uploadMajorImage']);
        Route::delete('/admin/academic/majors/{id}', [AdminAcademicController::class, 'deleteMajor']);

        Route::get('/admin/academic/subjects', [AdminAcademicController::class, 'indexSubjects']);
        Route::post('/admin/academic/subjects', [AdminAcademicController::class, 'storeSubject']);
        Route::put('/admin/academic/subjects/{id}', [AdminAcademicController::class, 'updateSubject']);
        Route::delete('/admin/academic/subjects/{id}', [AdminAcademicController::class, 'deleteSubject']);

        Route::get('/admin/subscriptions', [AdminSubscriptionController::class, 'indexSubscriptions']);
        Route::post('/admin/subscriptions/{id}/cancel', [AdminSubscriptionController::class, 'cancelSubscription']);
        Route::post('/admin/subscriptions/{id}/renew', [AdminSubscriptionController::class, 'renewSubscription']);

        Route::get('/admin/subscription-cards', [AdminSubscriptionController::class, 'indexCards']);
        Route::post('/admin/subscription-cards', [AdminSubscriptionController::class, 'storeCards']);
        Route::post('/admin/subscription-cards/export', [AdminSubscriptionController::class, 'exportCards']);
        Route::delete('/admin/subscription-cards/{id}', [AdminSubscriptionController::class, 'deleteCard']);
        Route::get('/admin/subscription-plans', [AdminSubscriptionController::class, 'indexPlans']);
        Route::post('/admin/subscription-plans', [AdminSubscriptionController::class, 'storePlan']);
        Route::put('/admin/subscription-plans/{id}', [AdminSubscriptionController::class, 'updatePlan']);
        Route::delete('/admin/subscription-plans/{id}', [AdminSubscriptionController::class, 'deletePlan']);

        Route::get('/admin/settings', [SystemSettingController::class, 'index'])->middleware('role:admin');
        Route::post('/admin/settings/bulk', [SystemSettingController::class, 'updateBulk'])->middleware('role:admin');
        Route::post('/admin/settings', [SystemSettingController::class, 'update'])->middleware('role:admin');
        Route::post('/admin/settings/rank-frames/upload', [SystemSettingController::class, 'uploadRankFrame'])->middleware('role:admin');

        // Dashboard Stats
        Route::get('/admin/dashboard-stats', [AdminDashboardController::class, 'index']);

        // Logs
        Route::get('/admin/logs', [LogController::class, 'index'])->middleware('role:admin');

        // Admin Challenges Settings & Gamification
        Route::get('/admin/challenges/settings', [\App\Http\Controllers\AdminChallengeController::class, 'getSettings']);
        Route::post('/admin/challenges/settings', [\App\Http\Controllers\AdminChallengeController::class, 'saveSettings']);
        Route::post('/admin/challenges/levels', [\App\Http\Controllers\AdminChallengeController::class, 'saveLevel']);
        Route::delete('/admin/challenges/levels/{id}', [\App\Http\Controllers\AdminChallengeController::class, 'deleteLevel']);
        Route::get('/admin/challenges/leaderboard', [\App\Http\Controllers\AdminChallengeController::class, 'getLeaderboard']);

        // Admin Resources
        Route::get('/admin/resources', [AdminResourceController::class, 'index']);
        Route::post('/admin/resources/{id}/approve', [AdminResourceController::class, 'approve']);
        Route::post('/admin/resources/{id}/reject', [AdminResourceController::class, 'reject']);
        Route::delete('/admin/resources/{id}', [AdminResourceController::class, 'destroy']);

        // Admin Reports
        Route::get('/admin/reports', [AdminReportController::class, 'index']);
        Route::post('/admin/reports/{id}/resolve', [AdminReportController::class, 'resolve']);
        Route::post('/admin/reports/{id}/dismiss', [AdminReportController::class, 'dismiss']);

        // Admin Interest Test
        Route::get('/admin/aptitude/questions', [AdminAptitudeController::class, 'indexQuestions']);
        Route::post('/admin/aptitude/questions', [AdminAptitudeController::class, 'storeQuestion']);
        Route::put('/admin/aptitude/questions/{id}', [AdminAptitudeController::class, 'updateQuestion']);
        Route::delete('/admin/aptitude/questions/{id}', [AdminAptitudeController::class, 'deleteQuestion']);
        Route::post('/admin/aptitude/update-settings', [AdminAptitudeController::class, 'updateSettings']);
        
        // Admin Suggestions
        Route::get('/admin/suggestions', [AdminSuggestionController::class, 'index']);
        Route::post('/admin/suggestions/{id}/review', [AdminSuggestionController::class, 'markAsReviewed']);
        Route::delete('/admin/suggestions/{id}', [AdminSuggestionController::class, 'destroy']);
    });

    // Student Subscriptions
    Route::post('/subscriptions/activate', [SubscriptionController::class, 'activateCard']);
    Route::get('/subscriptions/status', [SubscriptionController::class, 'status']);
    Route::get('/subscriptions/plans', [SubscriptionController::class, 'plans']);


    // Interest (Aptitude) Test
    Route::get('/aptitude-test', [AptitudeController::class, 'index']);
    Route::post('/aptitude-test/predict', [AptitudeController::class, 'predict']);
    Route::get('/aptitude-test/results/{uuid}', [AptitudeController::class, 'result']);
    Route::delete('/aptitude-test/results/{uuid}', [AptitudeController::class, 'destroy']);

    // Resource Management (Student)
    Route::get('/resources', [ResourceController::class, 'index']);

    // AI Quiz Generation System
    Route::get('/ai-quizzes', [\App\Http\Controllers\AiQuizController::class, 'index']);
    Route::post('/ai-quizzes', [\App\Http\Controllers\AiQuizController::class, 'store']);
    Route::get('/ai-quizzes/{uuid}', [\App\Http\Controllers\AiQuizController::class, 'show']);
    Route::post('/ai-quizzes/{uuid}/submit', [\App\Http\Controllers\AiQuizController::class, 'submit']);
    Route::post('/resources', [ResourceController::class, 'store']);
    Route::get('/my-resources', [ResourceController::class, 'getMyResources']);
    Route::post('/resources/{id}/like', [ResourceController::class, 'like']);
    Route::post('/resources/{id}/dislike', [ResourceController::class, 'dislike']);
    Route::post('/resources/{id}/download', [ResourceController::class, 'download']);

    // Reporting (Student)
    Route::post('/reports', [ReportController::class, 'store']);

    // Suggestions (Student)
    Route::get('/suggestions', [SuggestionController::class, 'index']);
    Route::post('/suggestions', [SuggestionController::class, 'store']);
    


    // Challenges
    Route::get('/challenges', [ChallengeController::class, 'index']);
    Route::post('/challenges', [ChallengeController::class, 'store']);
    Route::post('/challenges/join', [ChallengeController::class, 'join']);
    Route::get('/challenges/{uuid}', [ChallengeController::class, 'show']);
    Route::post('/challenges/{uuid}/sync', [ChallengeController::class, 'syncProgress']);
    Route::post('/challenges/{uuid}/end', [ChallengeController::class, 'endChallenge']);
    Route::delete('/challenges/{uuid}', [ChallengeController::class, 'destroy']);
    Route::delete('/challenges/{uuid}/kick/{userId}', [ChallengeController::class, 'kickParticipant']);
});
