# its-mab/mathbuddy-backend/app/core/misconception.py
def detect_misconception(a, b, c, d, operator, student_answer):
    """
    Return: 'direct_addition', 'denominator_error', 'lcm_error', 'none', atau 'unknown'
    """
    # Parsing jawaban siswa (misal "2/5" -> pembilang=2, penyebut=5)
    try:
        num, den = map(int, student_answer.split('/'))
    except:
        return 'unknown'

    # Cek Direct Addition: (a+c)/(b+d)
    if num == (a + c) and den == (b + d):
        return 'direct_addition'
    
    # Cek Denominator Error: (a+c)/b atau (a+c)/d (tidak disamakan)
    if den == b and num == (a + c):
        return 'denominator_error'
    if den == d and num == (a + c):
        return 'denominator_error'
    
    # Cek LCM Error: penyebut tidak sama dengan KPK, tapi penyebut = b*d (salah KPK)
    # Atau penyebut bukan KPK yang benar
    import math
    kpk = abs(b * d) // math.gcd(b, d)
    # Cek apakah siswa menjawab dengan penyebut yang salah (misal b*d tapi bukan hasil yang benar)
    if den != kpk and den == (b * d):
        return 'lcm_error'
    
    # Cek apakah jawaban benar
    # Kita sederhanakan: bandingkan dengan pecahan yang disederhanakan
    # (Untuk sekarang, kita asumsikan kunci jawaban sudah dalam bentuk sederhana)
    # Nanti di endpoint submit kita bandingkan dengan correct_answer
    
    # Jika tidak terdeteksi, return 'unknown'
    return 'unknown'