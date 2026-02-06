<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Show the user management page.
     */
    public function index()
    {
        $users = User::all();

        return Inertia::render('admin/manage-users', [
            'users' => $users,
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:admin,client',
            'status' => 'required|in:active,pending,declined',
        ]);

        $validated['password'] = bcrypt($validated['password']);
        User::create($validated);

        return back()->with('success', 'User created successfully.');
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'role' => 'required|in:admin,client',
            'status' => 'required|in:active,pending,declined',
        ]);

        $user->update($validated);

        return back()->with('success', 'User updated successfully.');
    }

    /**
     * Delete the specified user from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();

        return back()->with('success', 'User deleted successfully.');
    }

    /**
     * Approve a pending user.
     */
    public function approve(User $user)
    {
        if ($user->status !== 'pending') {
            return back()->with('error', 'Only pending users can be approved.');
        }

        $user->update(['status' => 'active']);

        return back()->with('success', 'User approved successfully.');
    }

    /**
     * Decline a pending user.
     */
    public function decline(User $user)
    {
        if ($user->status !== 'pending') {
            return back()->with('error', 'Only pending users can be declined.');
        }

        $user->update(['status' => 'declined']);

        return back()->with('success', 'User declined successfully.');
    }
}
