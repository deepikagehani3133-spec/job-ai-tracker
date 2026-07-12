<?php

namespace App\Http\Controllers;

use App\Models\AnswerEvaluation;
use App\Models\MockInterview;
use App\Models\ResumeAnalysis;
use App\Services\AiGateway;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class AiController extends Controller
{
    public function __construct(private readonly AiGateway $ai) {}

    public function analyzeResume(Request $request): JsonResponse
    {
        $data = $request->validate(['resume_text' => ['required', 'string', 'min:80', 'max:50000'], 'target_role' => ['nullable', 'string', 'max:120']]);
        try {
            $analysis = $this->ai->json("Analyze this resume for the target role '{$data['target_role']}'. Return JSON only with integer score (0-100), summary, strengths (array), gaps (array), and recommendations (array). Resume:\n{$data['resume_text']}");
        } catch (RuntimeException $e) { return response()->json(['message' => $e->getMessage()], 503); }
        $record = ResumeAnalysis::create(['user_id' => $request->user()->id, 'target_role' => $data['target_role'] ?? null, 'resume_text' => $data['resume_text'], 'score' => min(100, max(0, (int) ($analysis['score'] ?? 0))), 'analysis' => $analysis]);
        return response()->json(['data' => $record], 201);
    }

    public function evaluateAnswer(Request $request): JsonResponse
    {
        $data = $request->validate(['question' => ['required', 'string', 'max:3000'], 'answer' => ['required', 'string', 'min:20', 'max:20000']]);
        try {
            $feedback = $this->ai->json("Evaluate this interview answer. Return JSON only with integer score (0-100), summary, strengths (array), improvements (array), and improved_answer. Question: {$data['question']} Answer: {$data['answer']}");
        } catch (RuntimeException $e) { return response()->json(['message' => $e->getMessage()], 503); }
        $record = AnswerEvaluation::create(['user_id' => $request->user()->id, 'question' => $data['question'], 'answer' => $data['answer'], 'score' => min(100, max(0, (int) ($feedback['score'] ?? 0))), 'feedback' => $feedback]);
        return response()->json(['data' => $record], 201);
    }

    public function startMockInterview(Request $request): JsonResponse
    {
        $data = $request->validate(['target_role' => ['required', 'string', 'max:120'], 'difficulty' => ['required', 'in:easy,medium,hard']]);
        try {
            $result = $this->ai->json("Create a {$data['difficulty']} mock interview for a {$data['target_role']}. Return JSON only: {\"questions\":[five concise questions]}.");
        } catch (RuntimeException $e) { return response()->json(['message' => $e->getMessage()], 503); }
        $questions = array_values(array_filter($result['questions'] ?? [], 'is_string'));
        if (count($questions) < 3) return response()->json(['message' => 'AI returned insufficient interview questions.'], 502);
        $interview = MockInterview::create(['user_id' => $request->user()->id, 'target_role' => $data['target_role'], 'difficulty' => $data['difficulty'], 'questions' => $questions]);
        return response()->json(['data' => $interview], 201);
    }

    public function submitMockInterview(Request $request, MockInterview $mockInterview): JsonResponse
    {
        abort_unless($mockInterview->user_id === $request->user()->id, 403);
        $data = $request->validate(['answers' => ['required', 'array', 'min:1', 'max:10'], 'answers.*' => ['required', 'string', 'max:10000']]);
        try {
            $evaluation = $this->ai->json('Evaluate this mock interview. Return JSON only with overall_score, summary, strengths, improvements. Questions: '.json_encode($mockInterview->questions).' Answers: '.json_encode($data['answers']));
        } catch (RuntimeException $e) { return response()->json(['message' => $e->getMessage()], 503); }
        $mockInterview->update(['answers' => $data['answers'], 'evaluation' => $evaluation, 'status' => 'completed', 'completed_at' => now()]);
        return response()->json(['data' => $mockInterview->fresh()]);
    }
}
