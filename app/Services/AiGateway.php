<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class AiGateway
{
    public function complete(string $prompt): string
    {
        $key = config('services.groq.api_key');
        if (blank($key)) {
            throw new RuntimeException('AI features are not configured.');
        }

        try {
            $response = Http::acceptJson()->timeout(25)->retry(2, 250, throw: false)
                ->withToken($key)->post('https://api.groq.com/openai/v1/chat/completions', [
                    'model' => config('services.groq.model'),
                    'messages' => [['role' => 'user', 'content' => $prompt]],
                    'temperature' => 0.2,
                ]);
        } catch (ConnectionException) {
            throw new RuntimeException('AI service is unavailable.');
        }

        $content = $response->json('choices.0.message.content');
        if ($response->failed() || ! is_string($content) || blank($content)) {
            throw new RuntimeException('AI service is unavailable.');
        }

        return $content;
    }

    /** @return array<string, mixed> */
    public function json(string $prompt): array
    {
        $content = trim($this->complete($prompt));
        $content = preg_replace('/^```(?:json)?\s*|\s*```$/i', '', $content) ?? $content;
        $decoded = json_decode($content, true);
        if (! is_array($decoded)) {
            throw new RuntimeException('AI returned an invalid response.');
        }
        return $decoded;
    }
}
