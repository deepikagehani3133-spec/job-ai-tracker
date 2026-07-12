<?php

namespace App\Models;

use App\Enums\JobStatus;
use App\Events\JobStatusChanged;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class TrackedJob extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tracked_jobs';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'company',
        'role',
        'status',
        'notes',
        'salary_min',
        'salary_max',
        'location',
        'source_url',
        'contact_name',
        'contact_email',
        'applied_at',
        'interview_at',
        'archived_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => JobStatus::class,
            'salary_min' => 'integer',
            'salary_max' => 'integer',
            'applied_at' => 'date',
            'interview_at' => 'datetime',
            'archived_at' => 'datetime',
        ];
    }

    /**
     * Boot — fire a domain event whenever the status changes so
     * listeners (notifications, audit logs, analytics) can react.
     */
    protected static function booted(): void
    {
        static::updated(function (self $job) {
            if ($job->wasChanged('status')) {
                JobStatusChanged::dispatch(
                    $job->id,
                    optional($job->getOriginal('status'))?->value ?? null,
                    $job->status->value,
                );
            }
        });
    }

    // --- Relations ---------------------------------------------------------

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // --- Scopes ------------------------------------------------------------

    /**
     * Limit to a given user's jobs.
     */
    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Filter to a specific status (or array of statuses).
     *
     * @param  string|array<string>|null  $status
     */
    public function scopeWithStatus(Builder $query, string|array|null $status): Builder
    {
        if (empty($status)) {
            return $query;
        }
        return $query->whereIn('status', (array) $status);
    }

    /**
     * Exclude archived jobs by default.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->whereNull('archived_at');
    }

    /**
     * Fuzzy search across company / role / location.
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        $term = trim((string) $term);
        if ($term === '') {
            return $query;
        }
        return $query->where(function (Builder $q) use ($term) {
            $like = "%{$term}%";
            $q->where('company', 'like', $like)
                ->orWhere('role', 'like', $like)
                ->orWhere('location', 'like', $like);
        });
    }
}
