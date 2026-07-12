<?php

namespace App\Enums;

/**
 * The lifecycle status of a tracked job application.
 *
 * Backed by a string so it round-trips cleanly to the database
 * and is human-readable in storage / API responses.
 */
enum JobStatus: string
{
    case Applied = 'Applied';
    case Interview = 'Interview';
    case Offer = 'Offer';
    case Rejected = 'Rejected';
    case Withdrawn = 'Withdrawn';

    /**
     * Human-friendly label for the UI.
     */
    public function label(): string
    {
        return match ($this) {
            self::Applied => 'Applied',
            self::Interview => 'Interview',
            self::Offer => 'Offer',
            self::Rejected => 'Rejected',
            self::Withdrawn => 'Withdrawn',
        };
    }

    /**
     * Tailwind utility classes for badges / chips.
     * The UI pulls these from /api/jobs/meta so it never duplicates the list.
     *
     * @return array{text: string, classes: string}
     */
    public function badge(): array
    {
        return match ($this) {
            self::Applied => ['text' => 'text-blue-400', 'classes' => 'bg-blue-500/20 text-blue-400'],
            self::Interview => ['text' => 'text-yellow-400', 'classes' => 'bg-yellow-500/20 text-yellow-400'],
            self::Offer => ['text' => 'text-emerald-400', 'classes' => 'bg-emerald-500/20 text-emerald-400'],
            self::Rejected => ['text' => 'text-red-400', 'classes' => 'bg-red-500/20 text-red-400'],
            self::Withdrawn => ['text' => 'text-zinc-400', 'classes' => 'bg-zinc-500/20 text-zinc-400'],
        };
    }

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(fn (self $c) => $c->value, self::cases());
    }

    /**
     * @return list<array{value:string,label:string,color:string,bg:string}>
     */
    public static function options(): array
    {
        return array_map(fn (self $c) => [
            'value' => $c->value,
            'label' => $c->label(),
            'color' => $c->badge()['text'],
            'bg' => $c->badge()['classes'],
        ], self::cases());
    }
}
