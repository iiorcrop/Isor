import axios from 'axios';

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
                    if (po.Name && po.Name.trim()) {
                        mandalsSet.add(po.Name.trim());
                    }
                    if (po.Taluk && po.Taluk !== 'NA' && po.Taluk.trim()) {
                        mandalsSet.add(po.Taluk.trim());
                    }
                });

                const states = Array.from(statesSet).sort();
                const districts = Array.from(districtsSet).sort();
                const mandals = Array.from(mandalsSet).sort();

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
