

def build_analysis_context(analysis: dict) -> dict:
    attrs = analysis.get("attributes", {})
    stats = attrs.get("stats", {})
    results = attrs.get("results", {})

    flagged_engines = [
        {
            "engine": name,
            "category": r.get("category"),
            "method": r.get("method"),
        }
        for name, r in results.items()
        if r.get("category") in {"malicious", "suspicious", "failure"}
    ]

    return {
        "analysis_status": attrs.get("status"),
        "scan_date": attrs.get("date"),
        "engine_summary": {
            "malicious": stats.get("malicious", 0),
            "suspicious": stats.get("suspicious", 0),
            "undetected": stats.get("undetected", 0),
            "unsupported": stats.get("type-unsupported", 0),
            "failures": stats.get("failure", 0),
        },
        "flagged_engines": flagged_engines[:5],  # cap for token safety
    }
