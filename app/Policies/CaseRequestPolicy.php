<?php

namespace App\Policies;

use App\Models\CaseRequest;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class CaseRequestPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, CaseRequest $caseRequest): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, CaseRequest $caseRequest): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, CaseRequest $caseRequest): bool
    {
        return false;
    }

    /**
     * Determine whether the user can accept the case request.
     */
    public function accept(User $user, CaseRequest $caseRequest): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can reject the case request.
     */
    public function reject(User $user, CaseRequest $caseRequest): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, CaseRequest $caseRequest): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, CaseRequest $caseRequest): bool
    {
        return false;
    }
}
