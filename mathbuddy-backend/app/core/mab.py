# its-mab/mathbuddy-backend/app/core/mab.py
import random
import math

def select_arm(arms_params):
    """
    arms_params: list of dict [{'arm_id': 1, 'alpha': 1.5, 'beta': 2.0}, ...]
    Return: arm_id terpilih
    """
    best_arm = None
    max_sample = -float('inf')
    
    for arm in arms_params:
        # Sample dari distribusi Beta(alpha, beta)
        sample = random.betavariate(arm['alpha'], arm['beta'])
        if sample > max_sample:
            max_sample = sample
            best_arm = arm['arm_id']
    
    return best_arm

def update_arm_params(alpha, beta, reward):
    """
    Update alpha/beta berdasarkan reward.
    reward = +1 (benar), -0.5 (miskonsepsi), -1 (salah biasa)
    """
    if reward > 0:
        alpha += reward  # +1
    else:
        beta += 1
    return alpha, beta