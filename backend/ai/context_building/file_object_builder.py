# ai/context_builders/file_context.py

def build_file_context(file_obj: dict) -> dict:
    attrs = file_obj.get("attributes", {})

    return {
        "file_identity": {
            "name": attrs.get("meaningful_name"),
            "type": attrs.get("type_description"),
            "extension": attrs.get("type_extension"),
            "size_bytes": attrs.get("size"),
        },
        "hashes": {
            "md5": attrs.get("md5"),
            "sha256": attrs.get("sha256"),
        },
        "reputation": {
            "score": attrs.get("reputation"),
            "votes": attrs.get("total_votes"),
        },
        "analysis_summary": attrs.get("last_analysis_stats"),
        "threat_indicators": {
            "sandbox_verdicts": attrs.get("sandbox_verdicts"),
            "threat_verdict": attrs.get("threat_verdict"),
            "threat_severity": attrs.get("threat_severity"),
        },
        "tags": attrs.get("tags"),
    }
