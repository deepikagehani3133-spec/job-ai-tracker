<?php

namespace App\Services;

use App\Enums\JobStatus;
use InvalidArgumentException;

/**
 * Encapsulates the legal job-application state machine so the controller
 * (or any other caller) never has to know the rules.
 */
class JobStatusTransition
{
    /**
     * The graph of legal status transitions. Anything not listed is rejected.
     *
     * @var array<string, list<string>>
     */
    private const ALLOWED = [
        'Applied' => ['Interview', 'Rejected', 'Withdrawn'],
        'Interview' => ['Offer', 'Rejected', 'Withdrawn'],
        'Offer' => ['Withdrawn'],
        'Rejected' => [],
        'Withdrawn' => [],
    ];

    public function canTransition(?JobStatus $from, JobStatus $to): bool
    {
        if ($from === null) {
            // Initial create — any status is fine.
            return true;
        }
        if ($from === $to) {
            return true; // no-op
        }
        return in_array($to->value, self::ALLOWED[$from->value] ?? [], true);
    }

    /**
     * @throws InvalidArgumentException when the transition is not allowed.
     */
    public function assertCanTransition(?JobStatus $from, JobStatus $to): void
    {
        if (! $this->canTransition($from, $to)) {
            $fromLabel = $from?->label() ?? 'none';
            throw new InvalidArgumentException(
                "Illegal job status transition: {$fromLabel} → {$to->label()}"
            );
        }
    }
}
