import axios from 'axios';

/**
 * All Indian States and Union Territories, so the State dropdown is usable
 * even before a PIN code is entered (or if the PIN API is unreachable).
 */
export const INDIAN_STATES = [
    'Andaman and Nicobar Islands',
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chandigarh',
    'Chhattisgarh',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jammu and Kashmir',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Ladakh',
    'Lakshadweep',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Puducherry',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal'
];

/**
 * Maps a state name returned by the PIN API to its canonical spelling in
 * INDIAN_STATES so the value always matches an existing dropdown option.
 * @param {string} value
 * @returns {string}
 */
export const normalizeState = (value) => {
    const trimmed = (value || '').trim();
    if (!trimmed) return '';
    const match = INDIAN_STATES.find(s => s.toLowerCase() === trimmed.toLowerCase());
    return match || trimmed;
};

/**
 * Fetches location data (State, District, Mandals/Blocks) given a 6-digit Indian PIN Code.
 * Uses Postal PIN Code API (https://api.postalpincode.in/pincode/{PINCODE})
 * @param {string} pincode 
 * @returns {Promise<{success: boolean, state?: string, district?: string, mandals?: string[], message?: string}>}
 */
export const fetchLocationByPincode = async (pincode) => {
    const cleanPincode = (pincode || '').toString().trim();
    if (!/^\d{6}$/.exec(cleanPincode)) {
        return { success: false, message: 'Invalid PIN code length' };
    }

    try {
        const res = await axios.get(`https://api.postalpincode.in/pincode/${cleanPincode}`);
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
            const data = res.data[0];
            if (data.Status === 'Success' && Array.isArray(data.PostOffice) && data.PostOffice.length > 0) {
                const postOffices = data.PostOffice;
                
                const statesSet = new Set();
                const districtsSet = new Set();
                const mandalsSet = new Set();
                const postOfficeNames = new Set();

                postOffices.forEach(po => {
                    if (po.State && po.State.trim()) {
                        statesSet.add(po.State.trim());
                    }
                    if (po.District && po.District.trim()) {
                        districtsSet.add(po.District.trim());
                    }
                    if (po.Block && po.Block !== 'NA' && po.Block.trim()) {
                        mandalsSet.add(po.Block.trim());
                    }
                    if (po.Taluk && po.Taluk !== 'NA' && po.Taluk.trim()) {
                        mandalsSet.add(po.Taluk.trim());
                    }
                    if (po.Name && po.Name.trim()) {
                        postOfficeNames.add(po.Name.trim());
                    }
                });

                const states = Array.from(statesSet).sort();
                const districts = Array.from(districtsSet).sort();
                // Post office names are a last resort - they are localities, not mandals.
                const mandals = Array.from(mandalsSet.size > 0 ? mandalsSet : postOfficeNames).sort();

                return {
                    success: true,
                    state: states[0] || '',
                    district: districts[0] || '',
                    mandal: mandals[0] || '',
                    states,
                    districts,
                    mandals
                };
            } else {
                return { success: false, message: data.Message || 'No location details found for this PIN code.' };
            }
        }
        return { success: false, message: 'Unable to fetch PIN code information.' };
    } catch (err) {
        console.error('Error fetching PIN code details:', err);
        return { success: false, message: 'Network error fetching PIN code details.' };
    }
};
