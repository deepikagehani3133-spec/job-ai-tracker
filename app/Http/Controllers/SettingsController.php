<?php

namespace App\Http\Controllers;

use App\Models\UserSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    private const DEFAULTS = ['theme' => 'system', 'email_notifications' => true, 'interview_reminders' => true, 'weekly_digest' => true];

    public function show(Request $request): JsonResponse
    {
        $stored = $request->user()->settings()->pluck('value', 'key')->all();
        return response()->json(['data' => array_replace(self::DEFAULTS, $stored)]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate(['theme' => ['sometimes', 'in:light,dark,system'], 'email_notifications' => ['sometimes', 'boolean'], 'interview_reminders' => ['sometimes', 'boolean'], 'weekly_digest' => ['sometimes', 'boolean']]);
        foreach ($data as $key => $value) UserSetting::updateOrCreate(['user_id' => $request->user()->id, 'key' => $key], ['value' => $value]);
        return $this->show($request);
    }
}
