from num2words import num2words
from dateutil.relativedelta import relativedelta
from datetime import datetime

def convert_number_to_words(amount):
    """Converts a number to Indian words representation (e.g. Twenty Two Thousand)."""
    try:
        # num2words supports multiple languages/formats. 'en_IN' can be used for Indian numbering system
        return num2words(amount, lang='en_IN').title()
    except Exception:
        # Fallback to standard english if en_IN is not installed properly
        return num2words(amount).title()

def calculate_lease_end_date(start_date_str, duration_months):
    """Calculates lease end date given a start date string (YYYY-MM-DD) and duration in months."""
    try:
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
        end_date = start_date + relativedelta(months=int(duration_months))
        # Usually lease ends one day before the start date next year/month
        end_date = end_date - relativedelta(days=1)
        return end_date.strftime('%Y-%m-%d')
    except Exception as e:
        return ""

def enhance_data_payload(data_json):
    """Injects computed fields into data_json before passing to the document engine."""
    enhanced_data = data_json.copy()
    
    # Auto-convert numbers to words and format specific currency fields
    for key, value in data_json.items():
        if isinstance(value, (int, float)) or (isinstance(value, str) and value.isdigit()):
            num_val = int(value)
            words = convert_number_to_words(num_val)
            
            if key in ['monthly_rent', 'security_deposit']:
                enhanced_data[key] = f"Rs. {num_val}/- (Rupees {words} Only)"
            elif key == 'maintenance_charges':
                enhanced_data[key] = f"Rs. {num_val} as maintenance charge"
            
            enhanced_data[f"{key}_words"] = words
            
    # Auto-calculate lease end date if lease_start_date and lease_duration exist
    if 'lease_duration' in data_json and str(data_json['lease_duration']).isdigit():
        duration_months = int(data_json['lease_duration'])
        
        # Override the original value with "11 Months" text
        enhanced_data['lease_duration'] = f"{duration_months} Months"
        
        if 'lease_start_date' in data_json and data_json['lease_start_date']:
            computed_end = calculate_lease_end_date(
                data_json['lease_start_date'], 
                duration_months
            )
            enhanced_data['lease_end_date'] = computed_end
            
    # Append 'months' to lockin_period
    if 'lockin_period' in data_json and str(data_json['lockin_period']).isdigit():
        enhanced_data['lockin_period'] = f"{data_json['lockin_period']} months"
        
    return enhanced_data
