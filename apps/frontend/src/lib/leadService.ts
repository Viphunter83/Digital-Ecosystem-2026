
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export interface LeadData {
    name: string;
    phone: string;
    email: string;
    message: string;
    source?: string;
}

export const submitLead = async (data: LeadData) => {
    try {
        const response = await axios.post(`${API_URL}/ingest/leads`, {
            ...data,
            source: data.source || "site"
        });
        return response.data;
    } catch (error) {
        console.error("Failed to submit lead:", error);
        throw error;
    }
};
