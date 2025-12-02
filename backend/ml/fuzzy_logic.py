def fuzzy_risk_level(pm, co, voc, health_condition=None):
    score = 0

    if pm > 35:
        score += 2
    elif pm > 20:
        score += 1

    if co > 9:
        score += 2
    elif co > 4:
        score += 1

    if voc > 0.6:
        score += 2
    elif voc > 0.3:
        score += 1

    if health_condition == "Asthma":
        score += 2  # Increase risk for sensitive workers

    if score >= 6:
        return "High"
    elif score >= 3:
        return "Moderate"
    else:
        return "Low"
