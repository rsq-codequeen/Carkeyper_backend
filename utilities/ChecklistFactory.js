class ChecklistFactory {
    static createTemplate(rawData) {
        if (!rawData.title || !rawData.assigned_vehicle || !rawData.checklist_time) {
            throw new Error("Validation Error: Checklist header fields are missing.");
        }

        // Encapsulate and validate structure
        return {
            title: rawData.title.trim(),
            description: rawData.description ? rawData.description.trim() : null,
            assigned_vehicle: rawData.assigned_vehicle.trim(),
            checklist_time: rawData.checklist_time,
        };
    }

    static createItems(rawItems) {
        if (!rawItems || rawItems.length === 0) {
            return [];
        }

        return rawItems.map((item, index) => ({
            text: item.text ? item.text.trim() : '',
            sort_order: index + 1,
            requires_ok: item.requires_ok !== undefined ? item.requires_ok : 1,
        })).filter(item => item.text); 
    }
}
module.exports = ChecklistFactory;