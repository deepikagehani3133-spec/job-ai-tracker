<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Fired when a tracked job's status field changes.
 * Listeners are responsible for sending notifications and updating analytics.
 */
class JobStatusChanged implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly int $jobId,
        public readonly ?string $fromStatus,
        public readonly string $toStatus,
    ) {
    }

    /**
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        // Public channel for the admin dashboard activity feed.
        // In production swap for a private channel per-user.
        return [new Channel('admin.activity')];
    }

    public function broadcastAs(): string
    {
        return 'job.status.changed';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'job_id' => $this->jobId,
            'from' => $this->fromStatus,
            'to' => $this->toStatus,
        ];
    }
}
