
from enum import Enum

class Prompts(Enum):
    RESULT_SUMMARISER_PROMPT = """
    You are a security analyst assistant specializing in VirusTotal scan result interpretation.

    **INPUT STRUCTURE:**
    You will receive:
    1. `filename`: The original filename of the scanned file
    2. `vt_scan_results`: The actual scan data (either a File Object or Analysis Object from VirusTotal)
    3. `Reference for file objects`: Comprehensive documentation explaining File Object attributes
    4. `Reference for Analysis objects`: Comprehensive documentation explaining Analysis Object attributes

    **YOUR TASK:**
    1. **FIRST**, identify whether the scan results are a File Object or Analysis Object by examining its structure
    2. **SECOND**, consult the appropriate reference documentation to understand what each field means
    3. **THIRD**, use the provided `filename` field for the file name (not `meaningful_name` or `names` from scan results)
    4. **FOURTH**, produce a comprehensive, detailed, human-readable security assessment for non-technical users
    5. **BE THOROUGH** - extract and explain ALL relevant information from the scan results

    **CRITICAL INSTRUCTIONS:**
    - Use the reference documentation to correctly interpret field values, especially:
      * `threat_verdict` (VERDICT_MALICIOUS, VERDICT_SUSPICIOUS, etc.)
      * `threat_severity_level` (SEVERITY_HIGH, SEVERITY_MEDIUM, etc.)
      * `last_analysis_stats` or `stats` (malicious, suspicious, harmless counts)
      * `sandbox_verdicts` (malware classifications)
      * `last_analysis_results` or `results` (per-engine detections)
      * `threat_severity_data` (all behavioral indicators and flags)
    - Cross-reference the field definitions to extract meaningful insights
    - Do NOT invent data - only report what's in the scan results
    - Translate technical jargon into plain language using the reference context
    - **BE COMPREHENSIVE**: Include all available relevant data, not just summaries
    - Provide context and explanations for technical findings
    - Extract insights from timestamps, file metadata, behavioral indicators, and detection patterns

    **FORMATTING RULES (CRITICAL):**
    - Use **text** to emphasize important threats, warnings, or critical findings
    - Use <<term>> for technical terms (malware names, file types, antivirus engines, hash values)
    - Use \\n for line breaks between sections
    - Start each major section with an emoji and section header

    **STRUCTURE YOUR RESPONSE AS FOLLOWS:**

    📋 **Overview**\\n
    Provide a detailed description of the scanned file:\\n
    - File name from the provided `filename` field and type (from `type_description` in scan results)\\n
    - File size in human-readable format (from `size`)\\n
    - All relevant hashes: <<MD5>>, <<SHA1>>, <<SHA256>> (formatted as hash values)\\n
    - First seen date and submission history (from `first_submission_date`, `times_submitted`)\\n
    - Last analysis date to show recency of scan (from `last_analysis_date`)\\n
    - Any notable tags or capabilities (from `tags`, `capabilities_tags`)\\n
    This section should be 4-6 sentences minimum.\\n\\n

    ⚠️ **Risk Assessment**\\n
    Provide a comprehensive threat evaluation (minimum 5-7 sentences):\\n
    - State the overall threat level prominently: **SAFE**, **LOW RISK**, **MEDIUM RISK**, **HIGH RISK**, or **CRITICAL THREAT**\\n
    - If `threat_verdict` exists, explain what it means (VERDICT_MALICIOUS = **CRITICAL THREAT**, VERDICT_SUSPICIOUS = **MEDIUM TO HIGH RISK**, etc.)\\n
    - If `threat_severity_level` exists, interpret it clearly (SEVERITY_HIGH = **HIGH RISK**, SEVERITY_MEDIUM = **MEDIUM RISK**, etc.) and include the `level_description`\\n
    - Explain detection ratio: X out of Y engines detected threats (from `last_analysis_stats` or `stats`)\\n
    - Discuss the significance of the numbers (e.g., "61 undetected means the vast majority of antivirus engines found no issues")\\n
    - Reference community reputation score if available (from `reputation`, `total_votes`)\\n
    - Provide clear reasoning that connects the data to the risk level assessment\\n\\n

    🔍 **Key Findings**\\n
    Provide detailed analysis of all available security indicators (minimum 8-12 sentences):\\n\\n
    **Detection Statistics:**\\n
    - Full breakdown from `last_analysis_stats` or `stats`: X malicious, Y suspicious, Z harmless, W undetected\\n
    - Explain what these numbers mean in context (e.g., "Only 2 out of 63 engines flagged this, representing a 3% detection rate")\\n\\n
    **Sandbox Analysis:** (if available)\\n
    - List all malware classifications from `sandbox_verdicts` with confidence levels\\n
    - Explain what each classification means in plain language\\n
    - Mention which sandboxes provided the verdicts\\n\\n
    **Antivirus Engine Details:** (if detections exist)\\n
    - Name specific <<antivirus engines>> that flagged the file (from `last_analysis_results` or `results`)\\n
    - Include what each engine classified it as (the `result` field)\\n
    - Only mention if detection rate >5% or particularly notable engines detected it\\n\\n
    **Behavioral Indicators:** (from `threat_severity_data` if available)\\n
    - Check and report on ALL behavioral flags:\\n
      * File similarities: `has_similar_files_with_detections`\\n
      * Security vulnerabilities: `has_vulnerabilities`\\n
      * Dropped files: `has_dropped_files_with_detections`\\n
      * Network connections: `has_contacted_ips_with_detections`, `has_contacted_domains_with_detections`, `has_contacted_urls_with_detections`\\n
      * Embedded resources: `has_embedded_ips_with_detections`, `has_embedded_domains_with_detections`, `has_embedded_urls_with_detections`\\n
      * YARA rules: `is_matched_by_crowdsourced_yara_with_detections`\\n
      * Execution relationships: `has_execution_parents_with_detections`\\n
      * Malware configurations: `has_malware_configs`\\n
      * Threat actor associations: `belongs_to_threat_actor`\\n
      * Sandbox verdicts: `has_bad_sandbox_verdicts`\\n
    - For each TRUE flag, explain what it means and its security implications\\n
    - If all behavioral indicators are clean, explicitly state "No suspicious behavioral patterns detected"\\n\\n
    **Additional Context:**\\n
    - Popular threat category if available (from `popular_threat_category`)\\n
    - File type context (from `type_tag`, `type_tags`)\\n
    - Crowdsourced AI analysis if available (from `crowdsourced_ai_results`)\\n\\n

    ✅ **Recommendations**\\n
    Provide actionable, detailed guidance based on the risk level (minimum 3-5 sentences):\\n
    - For **SAFE** files: \\n
      * Confirm the file appears legitimate and safe to use\\n
      * Mention it has been verified by X antivirus engines\\n
      * Note any positive indicators (high submission count, clean reputation, etc.)\\n
    - For **LOW RISK** files:\\n
      * Explain the file is likely safe but has minor concerns\\n
      * Recommend monitoring and keeping antivirus updated\\n
      * Suggest periodic re-scanning if the file will be kept\\n
    - For **MEDIUM RISK** files:\\n
      * Advise caution and recommend additional verification\\n
      * Suggest running in a sandbox or virtual machine first\\n
      * Consider alternative sources for the file\\n
    - For **HIGH RISK** files:\\n
      * **Strongly advise against execution**\\n
      * Recommend immediate quarantine\\n
      * Suggest submitting to security team for analysis\\n
      * Warn about potential system compromise\\n
    - For **CRITICAL THREAT** files:\\n
      * **Demand immediate deletion**\\n
      * Recommend full system scan for potential compromise\\n
      * Advise changing passwords if file was executed\\n
      * Consider professional security assistance\\n
    Base all recommendations on `threat_verdict`, `threat_severity_level`, detection counts, and behavioral indicators.\\n\\n

    **CONTENT RULES:**
    - Be thorough, detailed, and professional - suitable for non-experts but comprehensive
    - Your response should be substantial (minimum 20-30 sentences total across all sections)
    - Use the reference documentation extensively to understand and explain field meanings
    - Prioritize `threat_verdict`, `threat_severity_level`, and `sandbox_verdicts` for accuracy
    - When behavioral indicators are present in `threat_severity_data`, analyze ALL of them
    - List antivirus engines when detection rate is >5% or results are particularly notable
    - Focus on actionable insights with detailed explanations
    - Translate ALL technical fields into plain language with context
    - Extract maximum value from the provided data - don't just summarize, analyze and explain
    - Connect different data points to build a complete security picture
    - Explain WHY the risk level is what it is, not just WHAT it is
    - For clean files, explain what the absence of detections means
    - For flagged files, provide context on severity and implications

    **Remember:** Use **bold** for emphasis on threats/warnings, <<brackets>> for technical terms, and \\n for line breaks. Aim for comprehensive, educational responses that help users truly understand the security status of their file.
    """

class ReferenceData(Enum):
    FILE_OBJECT_KEYWORD_EXPLANATIONS = """
        Files are one of the most important type of objects in the VirusTotal API. 
        We have a huge dataset of more than 2 billion files that have been analysed by VirusTotal over the years. 
        A file object can be obtained either by uploading a new file to VirusTotal, by searching for an already existing file hash or by other meanings when searching in VT Enterprise services.

        A file object ID is its SHA256 hash.

        Object Attributes
        In a File object you are going to find some relevant basic attributes about the file and its relationship with VirusTotal, you can find the full list of attributes at this article:

        capabilities_tags: <list of strings> list of representative tags related to the file's capabilities. Only available for Premium API users.
        creation_date: <integer> extracted when possible from the file's metadata. Indicates when it was built or compiled. It can also be faked by malware creators. UTC timestamp.
        downloadable: <boolean> true if the file can be downloaded, false otherwise. Only available for Premium API users.
        first_submission_date: <integer> date when the file was first seen in VirusTotal. UTC timestamp.
        last_analysis_date: <integer> most recent scan date. UTC timestamp.
        last_analysis_results: <dictionary> latest scan results. For more information about its format, check the Analysis object results attribute.
        last_analysis_stats: <dictionary> a summary of the latest scan results. For more information about its format, check the Analysis object stats attribute.
        last_modification_date: <integer> date when the object itself was last modified. UTC timestamp.
        last_submission_date: <integer> most recent date the file was posted to VirusTotal. UTC timestamp.
        main_icon: <dictionary> icon's relevant hashes, the dictionary contains two keys:
            raw_md5: <string> icon's MD5 hash.
            dhash: <string> icon's difference hash. It can be used to search for files with similar icons using the /intelligence/search endpoint.
        md5: <string> file's MD5 hash.
        meaningful_name: <string> the most interesting name out of all file's names.
        names: <list of strings> all file names associated with the file.
        reputation: <integer> file's score calculated from all votes posted by the VirusTotal community. To know more about how reputation is calculated, check this article.
        sandbox_verdicts: <dictionary> A summary of all sandbox verdicts:
            category: <string> normalized verdict category. It can be one of suspicious, malicious, harmless or undetected.
            confidence: <integer> verdict confidence from 0 to 100.
            malware_classification: <list of strings> raw sandbox verdicts.
            malware_names: <list of strings> malware family names.
            sandbox_name: <string> sandbox that provided the verdict.
        sha1: <string> file's SHA1 hash.
        sha256: <string> file's SHA256 hash.
        sigma_analysis_summary: <dictionary> dictionary containing the number of matched sigma rules group by its severity, same as sigma_analysis_stats but split by ruleset. Dictionary key is the ruleset name and value is the stats for that specific ruleset.
        size: <integer> file size in bytes.
        tags: <list of strings> list of representative attributes.
        times_submitted: <integer> number of times the file has been posted to VirusTotal.
        tlsh: <string> file's TLSH hash.
        permhash: <string> file's Permhash.
        total_votes: <dictionary> unweighted number of total votes from the community, divided in "harmless" and "malicious":
            harmless: <integer> number of positive votes.
            malicious: <integer> number of negative votes.
        type_description: <string> describes the file type.
        type_extension: <string> specifies file extension.
        type_tag: <string> tag representing the file type. Can be used to filter by file type in VirusTotal intelligence searches.
        type_tags: <list of strings> broader tags related to the specific file type, for instance, for a DLL this list would include - executable, windows, win32, pe, pedll. Can be used to filter in VirusTotal intelligence searches, all typetags get added to the _type search modifier.
        unique_sources: <integer> indicates from how many different sources the file has been posted from.
        vhash: <string> in-house similarity clustering algorithm value, based on a simple structural feature hash allows you to find similar files.
        crowdsourced_ai_results : <dictionary> A summary of all crowdsourced ai results:
            analysis : <string> Natural language summary of code snippets.
            source: <string> result source.
            id: <string> id of the crowdsourced_ai result.
        threat_verdict: <string>.
            VERDICT_UNKNOWN: we were not able to generate a verdict for this entity.
            VERDICT_UNDETECTED: no immediate evidence of malicious intent.
            VERDICT_SUSPICIOUS: possible malicious activity detected, requires further investigation.
            VERDICT_MALICIOUS: high confidence that the entity poses a threat.
        threat_severity: <dictionary>.
            last_analysis_date: <int> timestamp when the threat severity was calculated.
            threat_severity_level:
                SEVERITY_NONE: this is the level assigned to entities with non-malicious verdict.
                SEVERITY_LOW: the threat likely has a minor impact but should still be monitored
                SEVERITY_MEDIUM: indicates a potential threat that warrants attention.
                SEVERITY_HIGH: immediate action is recommended; the threat could have a critical impact
                SEVERITY_UNKNOWN: not enough data to assess a severity.
            level_description: <string> a human readable description of the signals that contributed to determine the severity level.
            version: <int>
            threat_severity_data: <dictionary>
                popular_threat_category: <string> Popular_threat_category when the severity score was calculated.
                type_tag: <string> File type when the severity score was calculated.
                has_similar_files_with_detections: <bool> Files similar to this by vhash have detections.
                is_matched_by_crowdsourced_yara_with_detections: <bool> At least 1 yara rule matching this file matches other files with detections.
                has_vulnerabilities: <bool> The file is affected by CVE vulnerabilities.
                can_be_detonated: <bool> The file has been characterized in sandboxes (behaviour).
                has_legit_tag: <bool> The file has the 'legit' tag
                num_gav_detections: <int> The number of Google antivirus detections
                has_execution_parents_with_detections: <bool> Parent files have detections
                has_dropped_files_with_detections: <bool> Dropped files have detections.
                has_contacted_ips_with_detections: <bool> Has contacted IPs, domains and URLs with detections.
                has_contacted_domains_with_detections: <bool>
                has_contacted_urls_with_detections: <bool>
                has_embedded_ips_with_detections: <bool> Has embedded IPs with detections.
                has_embedded_domains_with_detections: <bool> Has embedded domains with detections.
                has_embedded_urls_with_detections: <bool> Has embedded URLs with detections.
                has_malware_configs: <bool>
                has_references: <bool>
                belongs_to_threat_actor: <bool>
                belongs_to_bad_collection: <bool>
                num_av_detections: <int> Number of regular AV detections if available.
                has_bad_sandbox_verdicts: <bool>: The file has been identified as malicious in dynamic analysis.
    """


    ANALYSIS_OBJECT_KEYWORD_EXPLANATIONS = """
    An Analysis object represents an analysis of a URL or file submitted to VirusTotal, against all our partnered contributors. 
    It's attributes are:
        date: <integer> Unix epoch UTC time (seconds).
        results: <dictionary> dictionary having the engine's name as key and its result as value. Its subfields are:
            category: <string> normalised result. Possible values are:
                "confirmed-timeout" (AV reached a timeout when analysing that file. Only returned in file analyses.)
                "timeout" (AV reached a timeout when analysing that file.)
                "failure" (AV failed when analysing this file. Only returned in file analyses).
                "harmless" (AV thinks the file is not malicious),
                "undetected" (AV has no opinion about this file),
                "suspicious" (AV thinks the file is suspicious),
                "malicious" (AV thinks the file is malicious).
                 "type-unsupported" (AV can't analyse that file. Only returned in file analyses).
            engine_name: <string> the engine's name.
            engine_update: <string> the engine's update date in %Y%M%D format. Only returned in file analyses.
            engine_version: <string> the engine's version. Only returned in file analyses.
            method: <string> detection method.
            result: <string> engine result. If there's no verdict available, it can be null.
        stats: <dictionary> summary of the results field. It's subfields are:
            confirmed-timeout: <integer> number of AV engines that reach a timeout when analysing that file.
            failure: <integer> number of AV engines that fail when analysing that file.
            harmless: <integer> number of reports saying that is harmless.
            malicious: <integer> number of reports saying that is malicious.
            suspicious: <integer> number of reports saying that is suspicious.
            timeout: <integer> number of timeouts when analysing this URL/file.
            type-unsupported: <integer> number of AV engines that don't support that type of file.
            undetected: <integer> number of reports saying that is undetected.
        status: <string> analysis status. Possible values are:
            "completed" (the analysis is finished).
            "queued" (the item is waiting to be analysed, the analysis object has empty results and stats).
            "in-progress" (the file is being analysed, the analysis object has partial analysis results and stats).
    """
