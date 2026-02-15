<?php

namespace App\Policies;

use App\Models\Agreement;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class AgreementPolicy
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
    public function view(User $user, Agreement $agreement): bool
    {
        // Admin can view any agreement
        if ($user->isAdmin()) {
            return true;
        }

        // Client can only view their own agreement
        return $agreement->client_id === $user->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Agreement $agreement): bool
    {
        // Admin can update any agreement
        if ($user->isAdmin()) {
            return true;
        }

        // Client can only update their own pending agreement
        return $agreement->client_id === $user->id && $agreement->status === 'pending';
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Agreement $agreement): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can sign the model.
     */
    public function sign(User $user, Agreement $agreement): bool
    {
        // Only the client who the agreement is for can sign it
        return $agreement->client_id === $user->id && $agreement->status === 'pending';
    }

    /**
     * Determine whether the user can revoke the model's signature.
     */
    public function revokeSignature(User $user, Agreement $agreement): bool
    {
        // Only the client who signed can revoke, and only if signed
        return $agreement->client_id === $user->id && $agreement->status === 'signed';
    }
}
