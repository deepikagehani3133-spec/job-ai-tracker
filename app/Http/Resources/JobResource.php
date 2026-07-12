<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\TrackedJob
 */
class JobResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company' => $this->company,
            'role' => $this->role,
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'status_badge' => $this->status?->badge(),
            'notes' => $this->notes,
            'salary_min' => $this->salary_min,
            'salary_max' => $this->salary_max,
            'location' => $this->location,
            'source_url' => $this->source_url,
            'contact_name' => $this->contact_name,
            'contact_email' => $this->contact_email,
            'applied_at' => $this->applied_at?->toDateString(),
            'interview_at' => $this->interview_at?->toISOString(),
            'archived_at' => $this->archived_at?->toISOString(),
            'user_id' => $this->user_id,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
