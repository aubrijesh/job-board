
const semanticTypeMap = {
    job_title: 'text',
    company_name: 'text',
    location: 'text',
    job_type: 'select',
    experience_level: 'select',
    resume: 'file',
    other_files: 'file',
    salary_range: 'text',
    description: 'textarea',
    responsibilities: 'textarea',
    requirements: 'textarea',
    benefits: 'textarea',
    application_deadline: 'date',
    apply_link: 'url'
};

/* 
    @fielHelper object contains functions to generate HTML for each field type.
    Each function takes a field object as input and returns the HTML for that field.
    The function can use the following variables:
        - field.id: the ID of the field
        - field.label: the label of the field
        - field.type: the type of the field
        - field.required: whether the field is required or not
        - field.options: an array of options for select fields
        - field.listType: the type of list (ul or ol)
        - field.items: an array of items for list fields
        - field.text: the text for terms fields
*/
const fieldHelper = {
    spacing: function(field) {
        // Render a vertical space (default 24px, can be customized later)
        return `<div id="${field.id}" class="spacing-field" style="height:24px;"></div>`;
    },
    terms: function(field) {
        return `<label style="display:flex; align-items:center;"><input type="checkbox" id="${field.id}" name="${field.id}" style="width:auto; margin-right:8px;" />${field.text || 'I agree to the terms and conditions.'}</label>`;
    },
    text: function(field, requiredAttr, requiredMark) {
        return `<label for="${field.id}">${field.label}${requiredMark}</label><input type="text" id="${field.id}" name="${field.id}" placeholder="${field.label}" ${requiredAttr} />`;
    },
    url: function(field, requiredAttr, requiredMark) {
        return `<label for="${field.id}">${field.label}${requiredMark}</label><input type="url" id="${field.id}" name="${field.id}" placeholder="${field.label}" ${requiredAttr} />`;
    },
    date: function(field, requiredAttr, requiredMark) {
        return `<label for="${field.id}">${field.label}${requiredMark}</label><input type="date" id="${field.id}" name="${field.id}" placeholder="${field.label}" ${requiredAttr} />`;
    },
    textarea: function(field, requiredAttr, requiredMark) {
        return `<label for="${field.id}">${field.label}${requiredMark}</label><textarea id="${field.id}" name="${field.id}" placeholder="${field.label}" rows="3" ${requiredAttr}></textarea>`;
    },
    select: function(field, requiredAttr, requiredMark) {
        return `<label for="${field.id}">${field.label}${requiredMark}</label><select id="${field.id}" name="${field.id}" ${requiredAttr}>${field.options.map(o => `<option value="${o.value}">${o.label}</option>`).join("")}</select>`;
    },
    file: function(field, requiredAttr, requiredMark) {
        return `<label for="${field.id}">${field.label}${requiredMark}</label><input type="file" id="${field.id}" name="${field.id}${field.multiple ? '[]' : ''}"${field.accept ? ` accept=\"${field.accept}\"` : ''}${field.multiple ? ' multiple' : ''} ${requiredAttr}/>`;
    },
    paragraph: function(field) {
        return `<p id="${field.id}">${field.text || 'Paragraph text'}</p>`;
    },
    h1: function(field) {
        return `<h1 id="${field.id}">${field.text || 'Heading 1'}</h1>`;
    },
    h2: function(field) {
        return `<h2 id="${field.id}">${field.text || 'Heading 2'}</h2>`;
    },
    list: function(field) {
        const tag = field.listType === 'ol' ? 'ol' : 'ul';
        return `<${tag} id="${field.id}">${(field.options || []).map(item => `<li>${item}</li>`).join('')}</${tag}>`;
    }
};
const propertyHelpers = {
    getLabelProperty: function(field) {
        return `
            <label>Label:</label>
            <input type="text" id="prop-label" value="${field.label}" /><br/><br/>
        `;
    },
    getPlaceholderProperty: function(field) {
        return `
            <label>Placeholder:</label>
            <input type="text" id="prop-placeholder" value="${field.placeholder ? field.placeholder: field.label}" /><br/><br/>
        `;
    },
    getRequiredProperty: function(field) {
        return `
            <label>Required:</label>
            <input type="checkbox" id="prop-required" ${field.required ? "checked" : ""} /><br/><br/>
        `;
    },
    getAddItemButton: function(id) {
        // id: string for button id (e.g. 'add-list-item' or 'add-option')
        return `<button id="${id}" style="background:#3498db; color:#fff; border:none; border-radius:3px; padding:4px 12px; margin-top:6px; cursor:pointer; font-size:14px;">+ Add More</button>`;
    },
}
const UIHelper = {
    showDeleteCtrl: function() {
        $("#delete-field-btn").removeClass("hide");
    },
    hideDeleteCtrl: function() {
        $("#delete-field-btn").addClass("hide");
    },
    updateDropPlaceholder: function() {
        if ($("#job-form .form-field").length === 0) {
            $("#drop-placeholder").show();
        } else {
            $("#drop-placeholder").hide();
        }
    },
    emptyPropertyPanel: function() {
        $("#field-properties").empty().text("Select a field to edit");
    }
}


function sanitizeId(base) {
    return base.replace(/[^a-zA-Z0-9_]/g, "");
}

function generateUniqueId(base) {
    let suffix = 1;
    let newId = base;
    // Find the next available id (e.g., text1, text2, ...)
    while (droppedFields.some(f => f.id === newId)) {
        newId = base + suffix++;
    }
    return newId;
}

function renderAvailableFields() {
    fields.forEach(f => {
        // Use id if present, otherwise type as unique key
        const key = f.id || f.type;
        $("#available-fields").append(`<div class="field-item" data-id="${key}">${f.label}</div>`);
    });
}

renderAvailableFields();
let previewMode = false;
let $lastActiveField = null;
// Track dropped fields separately to support duplicates
let droppedFields = [];
$("#preview-toggle").on("click", function() {
    previewMode = !previewMode;
    if (previewMode) {
        // Hide left and right panels using visibility  
        $(".container").addClass("preview-enabled");  
        $lastActiveField = $(".form-field.active");
        if($lastActiveField.length) {
            $lastActiveField.removeClass('active');
        }
        $(this).text("Edit");
    } else {
        if($lastActiveField.length) {
            $lastActiveField.addClass('active');
        }
        // Show left and right panels using visibility
        $(".container").removeClass("preview-enabled");  
        // Restore borders and selection highlight
        $(this).text("Preview");
    }
});

// Make fields draggable
$(".field-item").draggable({
    helper: "clone",
    revert: "invalid"
});



function formFieldWrapper(field, innerHtml) {
    return `<div class="form-field" data-id="${field.id}">
        ${innerHtml}
    </div>`;
}

function getFieldHtml(field) {
    // For list fields, ensure options is used
    if (field.type === 'list') {
        field.options = field.options || [];
    }
        let requiredAttr = field.required ? 'required' : '';
        let requiredMark = field.required ? ' <span style="color:red">*</span>' : '';
        let innerHtml = '';
        // Use mapped type for rendering if available
        const renderType = semanticTypeMap[field.type] || field.type;
        if (fieldHelper[renderType]) {
            if (["text", "url", "date", "textarea", "select", "file"].includes(renderType)) {
                innerHtml = fieldHelper[renderType](field, requiredAttr, requiredMark);
            } else {
                innerHtml = fieldHelper[renderType](field);
            }
        } else {
            innerHtml = 'Unsupported field type';
        }
        return formFieldWrapper(field, innerHtml);
}

// Only allow one instance of input fields; allow multiples for non-input elements
const allowMultipleTypes = ["paragraph", "h1", "h2", "list", "spacing", "terms"];
$("#job-form").droppable({
    accept: ".field-item",
    drop: function(event, ui) {
        const fieldId = ui.helper.data("id");
        // Find by id if present, otherwise by type
        const origField = fields.find(f => (f.id || f.type) === fieldId);
        if (!origField) return;
        // Prevent duplicate drop for unique fields (by type only)
        if (
            !allowMultipleTypes.includes(origField.type) &&
            droppedFields.some(f => f.type === origField.type)
        ) {
            Toastify({
                text: origField.type +" aleady added",
                duration: 3000,
                newWindow: true,
                close: true,
                gravity: "bottom", // `top` or `bottom`
                position: "right", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                backgroundColor: "linear-gradient(to right, #b00000ff, #c93dadff)",
            }).showToast();
            //alert(origField.type +" aleady added");
            return;
        }
        // Clone the field object to allow duplicates for allowed types
        let field = JSON.parse(JSON.stringify(origField));
        // Generate a unique id based on label and a counter
        let baseLabel = sanitizeId((field.label || field.type || "field"));
        let newId = generateUniqueId(baseLabel);
        field.id = newId;
        droppedFields.push(field);
        const $newField = $(getFieldHtml(field)).css({display: 'none'});
        $("#job-form").append($newField);
        $newField.fadeIn(250, function() {
            $newField.addClass('form-field-animate');
            setTimeout(() => $newField.removeClass('form-field-animate'), 600);
        });
        makeJobFormSortable();
        UIHelper.updateDropPlaceholder();
    }
});

function makeJobFormSortable() {
    const $form = $("#job-form");
    if ($form.data('ui-sortable')) $form.sortable('destroy');
    $form.sortable({
        items: "> .form-field",
        tolerance: "pointer",
        placeholder: "sortable-placeholder",
        update: function() { UIHelper.updateDropPlaceholder(); }
    });
}

// property items helpers fuctions

const RenderHelpers = {
    renderListOrOptionsHtml: function(options, isSelect) {
        let html = '<div id="prop-list-items-list" style="display:flex; flex-direction:column;">';
        html += options.map((item, idx) => {
            if (isSelect) {
                // Two-row style for select options
                return `
                    <div class="option-row" data-idx="${idx}" style="display:flex; flex-direction:column; gap:4px; margin-bottom:6px; cursor:move; background:#f8f9fa; border:1px solid #e1e1e1; border-radius:5px; padding:7px 8px;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span class="option-drag-handle" style="cursor:move; font-size:18px; margin-right:4px;">&#9776;</span>
                            <label style="font-size:12px; color:#555; min-width:40px;">Label</label>
                            <input type="text" class="opt-label live-change" data-prop-name="label" value="${item.label}" placeholder="Label" style="padding:2px 6px; border-radius:3px; border:1px solid #ccc;" />
                            <button class="remove-option" title="Remove option">&#x2715;</button>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <label style="font-size:12px; color:#555; min-width:40px;">Value</label>
                            <input type="text" class="opt-value live-change" data-prop-name="value" value="${item.value}" placeholder="Value" style="padding:2px 6px; border-radius:3px; border:1px solid #ccc;" />
                        </div>
                    </div>
                `;
            } else {
                // Single-row style for list items, but use .option-row
                return `
                    <div class="option-row" data-idx="${idx}" style="display:flex; align-items:center; gap:8px; margin-bottom:6px; cursor:move; background:#f8f9fa; border:1px solid #e1e1e1; border-radius:5px; padding:7px 8px;">
                        <span class="option-drag-handle" style="cursor:move; font-size:18px; margin-right:4px;">&#9776;</span>
                        <input type="text" class="list-item-text live-change" data-prop-name="" value="${item}" placeholder="Item" style="padding:2px 6px; border-radius:3px; border:1px solid #ccc;" />
                        <button class="remove-list-item" title="Remove item">&#x2715;</button>
                    </div>
                `;
            }
        }).join("");
        html += '</div>';
        return html;
    }
}

function updateFieldOptions(fieldId,field) {
    if (field.type === "select") {
        const $select = $("#" + fieldId);
        $select.html(field.options.map(o => `<option value='${o.value}'>${o.label}</option>`).join(""));
    }
}
function updateListField(fieldId, field) {
    const tag = field.listType === 'ol' ? 'ol' : 'ul';
    $(`.form-field[data-id='${fieldId}'] ul, .form-field[data-id='${fieldId}'] ol`).replaceWith(`<${tag} id='${fieldId}'>${(field.options || []).map(item => `<li>${item}</li>`).join('')}</${tag}>`);
}

function renderListOrOptions(fieldId, field) {
    const isSelect = field.type === "select";
    // Always use options for both select and list
    const options = field.options || [];
    $("#prop-list-items").html(RenderHelpers.renderListOrOptionsHtml(options, isSelect));
    var $list = $("#prop-list-items-list");
    if ($list.data('ui-sortable')) {
        $list.sortable('destroy');
    }
    makeItemsSortable(fieldId, field, $list);
}

function makeItemsSortable(fieldId, field, $list) {
    const isSelect = field.type === "select";
    $list.sortable({
        handle: ".option-drag-handle",
        update: function(event, ui) {
            const newOrder = [];
            $list.find(".option-row").each(function() {
                const idx = $(this).data('idx');
                newOrder.push(field.options[idx]);
            });
            field.options = newOrder;
            if (isSelect) {
                updateFieldOptions(fieldId, field);
            } else {
                updateListField(fieldId, field);
            }
            renderListOrOptions(fieldId, field);
        }
    });
}

function initNewItemEvents() {
    var field = selectedField;
    var fieldId= selectedField.id;
    const $propPanel = $('#field-properties');
    // Render options if applicable
    if (field.type === "select" || field.type === "list") {
        // Add item/option
        $("#add-list-item").off().on("click", function(e) {
            e.preventDefault();
            if (field.type === "select") {
                field.options.push({ label: "New Option", value: "new_value" });
            } else {
                field.options = field.options || [];
                field.options.push("New item");
            }
            renderListOrOptions(fieldId, field);
            if (field.type === "select") updateFieldOptions(fieldId, field);
            else updateListField(fieldId, field);
        });
        // Remove item/option
        $(document).off("click.removeitem").on("click.removeitem", ".remove-option, .remove-list-item", function(e) {
            e.preventDefault();
            const idx = $(this).closest('.option-row').data('idx');
            field.options.splice(idx, 1);
            renderListOrOptions(fieldId, field);
            if (field.type === "select") updateFieldOptions(fieldId, field);
            else updateListField(fieldId, field);
        });
        // Use a single class and event listener for all live changes
        
        $propPanel.off("input.livechange").on("input.livechange", ".live-change", function() {
            const $input = $(this);
            const propName = $input.data('prop-name');
            var $optionRow = $input.closest('.option-row');
            if($optionRow.length > 0) {
                var idx = $optionRow.data('idx');
                if (field.type === 'select') {
                    if (propName) {
                        field.options[idx][propName] = $input.val();
                    } else {
                        field.options[idx] = $input.val();
                    }
                    updateFieldOptions(fieldId, field);
                } else if (field.type === 'list') {
                    // For list, options is a string array
                    if (!propName) {
                        field.options[idx] = $input.val();
                        updateListField(fieldId, field);
                    }
                }
            }
        });
        // Change list type
        if (field.type === "list") {
            $("#prop-list-type").on("change", function() {
                field.listType = $(this).val();
                updateListField(fieldId, field);
            });
        }
    }

    // Update field on change
    if (["paragraph", "h1", "h2", "terms"].includes(field.type)) {
        $("#prop-text").on("input", function() {
            field.text = $(this).val();
            if (field.type === 'terms') {
                $(`.form-field[data-id='${fieldId}'] label`).contents().filter(function() { return this.nodeType === 3; }).last().replaceWith(field.text);
            } else {
                $(`.form-field[data-id='${fieldId}'] ${field.type === 'paragraph' ? 'p' : field.type}`).text(field.text);
            }
        });
    } else {
        $("#prop-label").on("input", function() {
            field.label = $(this).val();
            let requiredMark = field.required ? ' <span style="color:red">*</span>' : '';
            $(`.form-field[data-id='${fieldId}'] label`).html(field.label + requiredMark);
            // Do not update placeholder when label changes
        });

        $("#prop-placeholder").on("input", function() {
            $(`#${fieldId}`).attr("placeholder", $(this).val());
        });

        $("#prop-required").on("change", function() {
            field.required = $(this).is(":checked");
            let requiredMark = field.required ? ' <span style="color:red">*</span>' : '';
            $(`.form-field[data-id='${fieldId}'] label`).html(field.label + requiredMark);
            $(`#${fieldId}`).prop("required", field.required);
        });
    }
}


makeJobFormSortable();
UIHelper.updateDropPlaceholder();

var selectedField = null;
// Modular handler for field click
function handleFormFieldClick(e) {
    UIHelper.updateDropPlaceholder();
    $(".form-field").removeClass("active");
    $(this).addClass("active");

    const fieldId = $(this).data("id");
    // Look for the field in droppedFields first, fallback to fields for legacy
    let field = droppedFields.find(f => f.id === fieldId) || fields.find(f => f.id === fieldId);
    if (!field) return;
    selectedField = field;
    // Show properties form
    let propHtml = "";
    // Only render the panel if a field is selected
    if (field) {
        if (["paragraph", "h1", "h2", "terms"].includes(field.type)) {
            propHtml += `<label>Text:</label><textarea id="prop-text" rows="2" style="width:95%">${field.text || ''}</textarea><br/><br/>`;
        } else {
            // Always show label for all other fields
            propHtml += `${propertyHelpers.getLabelProperty(field)}`;
            if (field.type === "list") {
                propHtml += `<label>List Type:</label> <select id="prop-list-type"><option value="ul" ${field.listType === 'ul' ? 'selected' : ''}>Bulleted</option><option value="ol" ${field.listType === 'ol' ? 'selected' : ''}>Numbered</option></select><br/><br/>`;
                propHtml += `<label>Options:</label><div id="prop-list-items"></div>${propertyHelpers.getAddItemButton('add-list-item')}<br/><br/>`;
            } else if (field.type === "select") {
                propHtml += `<label>Options:</label><div id="prop-list-items"></div>${propertyHelpers.getAddItemButton('add-list-item')}<br/><br/>`;
            } else {
                propHtml += `${propertyHelpers.getPlaceholderProperty(field)}
                ${propertyHelpers.getRequiredProperty(field)}`;
            }
        }
        // If select/radio, show options editor (legacy, keep for radio if needed)
        if (field.type === "select" || field.type === "radio") {
            // No need to add another button, already handled above
        }
        $("#field-properties").html(propHtml);
        UIHelper.showDeleteCtrl();
    } else {
        // No field selected, clear the panel
        UIHelper.emptyPropertyPanel();
        UIHelper.hideDeleteCtrl();
    }

    if (field.type === "select" || field.type === "list") {
        renderListOrOptions(fieldId, field);
    }
    initNewItemEvents();
}

// Register the modular handler
$(document).on("click", ".form-field", handleFormFieldClick);

// Delete dropped field handler (now only in property panel)
$(document).on("click", ".delete-field-btn", function(e) {
    e.stopPropagation();
    // Use data-delete-id if present (property panel), else fallback to closest .form-field
    const fieldId = $(this).attr('data-delete-id') || $(this).closest('.form-field').data('id');
    const $field = $(`.form-field.active`);
    if($field.length > 0) {
         // Remove from droppedFields
        droppedFields = droppedFields.filter(f => f.id !== fieldId);
        $field.fadeOut(200, function() {
            $field.remove();
            UIHelper.updateDropPlaceholder();
            if($(".form-field").length === 0) {
                UIHelper.emptyPropertyPanel();
                UIHelper.hideDeleteCtrl();
            }
            else {
                // Select the first field if any remain
                $(".form-field").first().trigger("click");
            }
        });
    }
    else {
        UIHelper.emptyPropertyPanel();
        UIHelper.hideDeleteCtrl();
    }
   
});
