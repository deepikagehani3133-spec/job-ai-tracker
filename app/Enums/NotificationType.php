<?php

namespace App\Enums;

enum NotificationType: string
{
    case JobStatusChanged = 'job_status_changed';
    case InterviewCompleted = 'interview_completed';
    case AdminAnnouncement = 'admin_announcement';
    case Welcome = 'welcome';
}
