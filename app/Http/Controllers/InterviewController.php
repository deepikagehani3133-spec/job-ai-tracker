<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class InterviewController extends Controller
{
    public function generateQuestions(Request $request)
    {
        $data = $request->validate([
            'role' => ['required', 'string', 'min:2', 'max:120'],
        ]);

        $apiKey = config('services.groq.api_key');
        if (blank($apiKey)) {
            return response()->json([
                'message' => 'Interview question generation is not configured.',
            ], 503);
        }

        $prompt = "Generate five concise interview questions for a {$data['role']} role. Return one question per line, without numbering or additional commentary.";
        $response = Http::acceptJson()
            ->timeout(20)
            ->retry(2, 200, throw: false)
            ->withToken($apiKey)
            ->post(
                'https://api.groq.com/openai/v1/chat/completions',
                [
                    'model' => config('services.groq.model'),
                    'messages' => [[
                        'role' => 'user',
                        'content' => $prompt,
                    ]],
                ]
            );

        $content = $response->json('choices.0.message.content');
        if ($response->failed() || ! is_string($content) || blank($content)) {
            return response()->json([
                'message' => 'Unable to generate interview questions right now.',
            ], 502);
        }

        return response()->json([
            'result' => $content,
        ]);
    }
}
