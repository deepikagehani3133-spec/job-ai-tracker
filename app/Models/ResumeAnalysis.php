<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResumeAnalysis extends Model
{
    protected $fillable = ['user_id', 'target_role', 'resume_text', 'score', 'analysis'];
    protected $hidden = ['resume_text'];
    protected function casts(): array { return ['analysis' => 'array']; }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
