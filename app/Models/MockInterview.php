<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MockInterview extends Model
{
    protected $fillable = ['user_id', 'target_role', 'difficulty', 'questions', 'answers', 'evaluation', 'status', 'completed_at'];
    protected function casts(): array { return ['questions' => 'array', 'answers' => 'array', 'evaluation' => 'array', 'completed_at' => 'datetime']; }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
