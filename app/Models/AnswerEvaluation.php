<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnswerEvaluation extends Model
{
    protected $fillable = ['user_id', 'question', 'answer', 'score', 'feedback'];
    protected $hidden = ['answer'];
    protected function casts(): array { return ['feedback' => 'array']; }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
