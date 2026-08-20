# its-mab/mathbuddy-backend/app/core/representation.py
def determine_next_representation(
    recent_history,
    current_rep,
    misconception_history=None,
    target_misconception=None
):
    """
    Menentukan representasi berikutnya berdasarkan aturan:
    1. Naik jika 3 benar berturut-turut (visual -> garis_bilangan -> simbolik)
    2. Turun jika jawaban terakhir salah
    3. (Rule 4) Jika di visual dan miskonsepsi yang sama terjadi >=3 kali, tetap visual
    """
    # Rule 4: Jika di visual, dan miskonsepsi yang sama terjadi >= 3 kali
    if current_rep == 'visual' and misconception_history and target_misconception:
        same_misconception_count = sum(
            1 for m in misconception_history if m == target_misconception
        )
        if same_misconception_count >= 3:
            return 'visual'  # tetap di visual

    # Rule 1: Naik jika 3 benar berturut-turut
    if len(recent_history) >= 3 and all(recent_history[-3:]):
        if current_rep == 'visual':
            return 'garis_bilangan'
        elif current_rep == 'garis_bilangan':
            return 'simbolik'
        else:
            return 'simbolik'

    # Rule 2: Turun jika jawaban terakhir salah
    if recent_history and not recent_history[-1]:
        if current_rep == 'simbolik':
            return 'garis_bilangan'
        elif current_rep == 'garis_bilangan':
            return 'visual'
        else:
            return 'visual'

    return current_rep