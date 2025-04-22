
let current_chat_id = 0;

const blank_profile_picture = "images/blank_profile_picture.png"

const message_input = document.getElementById("msg_input");
const chat_list = document.getElementById("chat_list");
const chat_div = document.getElementById("chat")
const contact_name = document.getElementById("contact_name")
const contact_image = document.getElementById("contact_image")

const overlay = document.getElementById("overlay")

const contact_popup = document.getElementById("contact_popup")
const new_contact_image_preview = document.getElementById("new_contact_image_preview");
const new_contact_name_input = document.getElementById("new_contact_name_input");
const contact_crop_button = document.getElementById("contact_crop_button")

const group_popup = document.getElementById("group_popup")
const new_group_image_preview = document.getElementById("new_group_image_preview");
const new_group_name_input = document.getElementById("new_group_name_input");
const group_crop_button = document.getElementById("group_crop_button")

const sender_popup = document.getElementById("message_sender_popup")
const possible_sender_list = document.getElementById("possible_sender_list")

const import_popup = document.getElementById("import_popup")

const getContactFromId = id => chats_list.find(chat => chat.id == id);
const getNameFromId = id => chats_list.find(chat => chat.id == id).name;

function getImageFromContact(contact){
    if(contact.image == "BLANK"){
        return blank_profile_picture
    }
    return contact.image
}

const name_colors = ["red", "blue", "limegreen", "yellow", "green", "purple", "orange"]

let chats_list = [
    {"id": 0, "name": "Test", "image": "BLANK"}
]
let chats = [
    {
        "is_group": false,
        "name": "Test",
        "chat": [
            {"text": "Use the right-pointing arrow to send messages as yourself", "from": "ME","timestamp": 1713462000000},
            {"text": "And use the left-pointing one to receive messages!", "from": "CONTACT", "timestamp": 1713462000000},
            {"text": "Or simply use ENTER", "from": "ME","timestamp": 1713462000000},
            {"text": "or SHIFT + ENTER", "from": "CONTACT","timestamp": 1713462000000}
        ]
    }
]

function goToChatList(){
    document.getElementById("chat_list_ui").style.display = "block"        
    document.getElementById("chat_ui").style.display = "none"
}

function goToChat(){
    document.getElementById("chat_list_ui").style.display = "none"        
    document.getElementById("chat_ui").style.display = "block"
}

function isOnMobile(){
    if (window.matchMedia("(max-width: 800px)").matches) {
        return true
    }
    return false
}

function convertTimestampToString(timestamp){
    return (new Date(timestamp).toLocaleTimeString()).slice(0, 5)
}

function toggleVisibility(id, remove = false){
    if(remove){
        if(document.getElementById(id).style.display == "none"){
            document.getElementById(id).style.display = "block"
        } else{       
            document.getElementById(id).style.display = "none"
        }
    } else{
        if(document.getElementById(id).style.visibility == "hidden"){
            document.getElementById(id).style.visibility = "visible"
        } else{       
            document.getElementById(id).style.visibility = "hidden"
        }
    }
}







// CHATS

function update_chats(){
    chat_list.innerHTML = "";

    for(let contact of chats_list){
        let chat_div = document.createElement("div");
        chat_div.className = "chat_div"
        
        
        let chat_image = document.createElement("img");
        chat_image.src = getImageFromContact(contact)
        chat_image.className = "circle list_profile_picture profile_picture"


        let chat_button = document.createElement('button');
        chat_button.textContent = contact.name;
        chat_button.className = "chat_button"
        chat_button.onclick = function(){changeChat(contact)}
        
        chat_div.appendChild(chat_image)
        chat_div.appendChild(chat_button)
        chat_list.appendChild(chat_div)
    }
}

function changeChat(contact_data){

    if(isOnMobile()) goToChat()

    let chat_data

    chat_div.innerHTML = ""; // Cleares the chat

    current_chat_id = contact_data.id
    chat_data = chats[contact_data.id]
    
    contact_name.textContent = chat_data.name
    contact_image.src = getImageFromContact(contact_data)

    for(let message of chat_data.chat){
        addMessageToChat(message)
    }
}

function addMessageToChat(data){


    let isYours = data.from == "ME";

    // Creates message div
    let message_div = document.createElement('div');
    message_div.className = "message";

    // Creates the bubble
    let bubble = document.createElement("div");
    bubble.className = "bubble " + (isYours ? "bubble_sent" : "bubble_received")

    let bubble_author = document.createElement("p")
    if(chats[current_chat_id].is_group && !isYours){        
        bubble_author.textContent = getNameFromId(data.from)
        bubble_author.style.color = name_colors[data.from % name_colors.length]
        bubble_author.className = "bubble_author"
    }

    // Adds the text
    let bubble_text = document.createElement("p");
    bubble_text.textContent = data.text;
    bubble_text.className = "bubble_text";

    // Adds the time
    let bubble_time = document.createElement("p");
    bubble_time.textContent = convertTimestampToString(data.timestamp)
    bubble_time.className = "bubble_time"

    // Adds everything to the chat
    if(!isYours && chats[current_chat_id].is_group) bubble.appendChild(bubble_author)
    bubble.appendChild(bubble_text)
    bubble.appendChild(bubble_time)
    chat_div.appendChild(bubble)

    
    chat_div.scrollTop = chat_div.scrollHeight;

    message_input.value = ""
}

function sendMessage(from = "ME"){

    message = message_input.value;

    if(!message.trim()) return

    if(chats[current_chat_id].is_group && from !== "ME"){
        openSenderPopup(message, from)
        return
    }
    
    message_input.value= "";

    let message_obj = {
        "text": message,
        "from": from,
        "timestamp": Date.now()
    }
    
    chats[current_chat_id].chat.push(message_obj)

    addMessageToChat(message_obj)
}







// POPUPS

let cropper;

function openContactPopup(){
    overlay.style.display = "block";
    contact_popup.style.display = "block"
}

function closeContactPopup(){
    overlay.style.display = "none";
    contact_popup.style.display = "none"
    new_contact_image_preview.src = blank_profile_picture
    document.getElementById("new_contact_img_input").value = ""
    new_contact_name_input.value = ""
}

function finishContactCreation(){
    let contact_name = new_contact_name_input.value.trim()

    if(!contact_name){
        alert("Insert a name")
        return
    }

    createNewContact(contact_name, new_contact_image_preview.src)
    closeContactPopup()    
}

document.getElementById("new_contact_img_input").addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;


    const reader = new FileReader();
    reader.onload = function (event) {
        new_contact_image_preview.src = event.target.result;

        if (cropper) cropper.destroy();
        cropper = new Cropper(new_contact_image_preview, {
            aspectRatio: 1,
            viewMode: 1,
        });
        
        contact_crop_button.style.display = "block"
        document.getElementById("contact_done").disabled = true;
    };
    reader.readAsDataURL(file);
});

function cut_contact_image() {

    contact_crop_button.style.display = "none"

    const canvas = cropper.getCroppedCanvas({
        width: 300,
        height: 300
    });
    cropper.destroy()
    const imageDataURL = canvas.toDataURL()
    new_contact_image_preview.src = imageDataURL;
    document.getElementById("contact_done").disabled = false;
}

function createNewContact(name, image){
    let new_contact = {
        "name": name,
        "image": image,
        "id": chats_list.length
    }

    chats_list.push(new_contact)
    update_chats()
    chats.push(
        {
            "is_group": false,
            "name": new_contact.name,
            "chat": []
        }
    )
}




function openGroupPopup(){
    overlay.style.display = "block";
    group_popup.style.display = "block";

    for(let contact of chats_list){
        if(chats[contact.id].is_group) continue;

        let contact_label = document.createElement("label")
        contact_label.dataset.id = contact.id
        contact_label.className = "contact_label"
        contact_label.style.display = "flex"
        contact_label.style.alignItems = "center"
        contact_label.innerHTML = '<input type = "checkbox" class = "participant_checkbox"><img width = "30" height = "30" class = "profile_photo circle" src = "' + 
        getImageFromContact(contact) + '">'  + contact.name

        document.getElementById("participants_list").appendChild(contact_label)
    }
}

function closeGroupPopup(){    
    overlay.style.display = "none";
    group_popup.style.display = "none";
    document.getElementById("participants_list").innerHTML = ""
    new_group_image_preview.src = blank_profile_picture
    new_group_name_input.value = ""
}

document.getElementById("new_group_img_input").addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;


    const reader = new FileReader();
    reader.onload = function (event) {
        new_group_image_preview.src = event.target.result;

        if (cropper) cropper.destroy();
        cropper = new Cropper(new_group_image_preview, {
            aspectRatio: 1,
            viewMode: 1,
        });
        
        group_crop_button.style.display = "block"
        document.getElementById("group_done").disabled = true;
    };
    reader.readAsDataURL(file);
});

function cut_group_image() {

    group_crop_button.style.display = "none"

    const canvas = cropper.getCroppedCanvas({
        width: 300,
        height: 300
    });
    cropper.destroy()
    const imageDataURL = canvas.toDataURL()
    new_group_image_preview.src = imageDataURL;
    document.getElementById("group_done").disabled = false;
}

function finishGroupCreation(){

    const group_name = new_group_name_input.value.trim()

    let participants_ids = []

    for(let label of document.getElementById("participants_list").children){
        if(label.children[0].checked){
            participants_ids.push(Number(label.dataset.id))
        }
    }

    if(!group_name){
        alert("Insert a name")
        return
    }

    if(participants_ids.length == 0){
        alert("Insert participants")
        return
    }
    
    createNewGroup(group_name, new_group_image_preview.src, participants_ids)
    closeGroupPopup()
}

function createNewGroup(name, image, participants_ids){
    
    let new_group = {
        "name": name,
        "image": image,
        "id": chats_list.length
    }

    chats_list.push(new_group)
    update_chats()
    chats.push(
        {
            "is_group": true,
            "name": new_group.name,
            "participants": participants_ids,
            "chat": []
        }
    )
}




function openSenderPopup(message){
    overlay.style.display = "block"
    sender_popup.style.display = "block"

    for(let contact_id of chats[current_chat_id].participants){

        let contact = getContactFromId(contact_id)

        let chat_div = document.createElement("div")
        chat_div.className = "chat_div"

        let chat_image = document.createElement("img");
        chat_image.src = getImageFromContact(contact)
        chat_image.className = "circle list_profile_picture profile_picture"

        let chat_button = document.createElement('button');
        chat_button.textContent = contact.name;
        chat_button.className = "chat_button"
        chat_button.onclick = function(){
            let message_obj = {
                "text": message,
                "from": contact.id,
                "timestamp": Date.now()
            }
            addMessageToChat(message_obj)
            chats[current_chat_id].chat.push(message_obj)
            closeSenderPopup()
        };

        chat_div.appendChild(chat_image)
        chat_div.appendChild(chat_button)
        possible_sender_list.appendChild(chat_div)
    }
    
}

function closeSenderPopup(){    
    overlay.style.display = "none"
    sender_popup.style.display = "none"
    possible_sender_list.innerHTML = ""
}









// IMPORT & EXPORT


let jsonData;

function isValidChatData(data) {
    if (!Array.isArray(data)) return false;

    for (let contact of data) {
        if (
            typeof contact.name !== "string" &&
            typeof contact.id !== "number" &&
            typeof contact.image !== "string" &&
            !Array.isArray(contact.chat)
        ) return false;

        for (let msg of contact.chat) {
            if (
                typeof msg.text !== "string" &&
                (typeof msg.from !== "string" || typeof msg.from !== "number") &&
                typeof msg.timestamp !== "number"
            ) return false;
        }
    }

    return true;
}

function openImportPopup(){
    overlay.style.display = "block";
    import_popup.style.display = "block"
}

function closeImportPopup(is_close_button = false){
    if(!is_close_button)
        {if(!isValidChatData(jsonData)){
            alert("That isn't valid data");
            return
        }

        importChats(jsonData)
    }
    
    document.getElementById('json_file_input').value = ""
    jsonData = ""
    overlay.style.display = "none";
    import_popup.style.display = "none"
}

document.getElementById('json_file_input').addEventListener('change', function(event) {
    const file = event.target.files[0];  
    if (file) {
        const reader = new FileReader(); 
        reader.onload = function(e) {
            jsonData = JSON.parse(e.target.result); 
        };
        reader.readAsText(file);
    }
});

function importChats(data){

    for(let contact of data){
        let chatData = {
            "is_group": contact.is_group,
            "name": contact.name,
            "chat": contact.chat
        }

        if(chatData.is_group){
            chatData.participants = contact.participants
        }

        let contact_data = {
            "id": chats.length,
            "name": contact.name,
            "image": contact.image
        }

        chats.push(chatData)
        chats_list.push(contact_data)
    }

    update_chats()
}




function exportChats() {

    const chatsToExport = chats.slice(1, chats.length)

    for(let chat of chatsToExport){
        chat.image = chats_list[chats.indexOf(chat)].image
    }

    if(chatsToExport.length == 0){
        alert("You didn't create any chat")
        return
    }


    const json = JSON.stringify(chatsToExport, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "chats.json";
    a.click();


    URL.revokeObjectURL(url);
}





document.getElementById("receive_button_checkbox").addEventListener("change", function(){
    toggleVisibility("receive_button", true)
});

document.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        if (event.shiftKey) {
            sendMessage("CONTACT")
        } else {
            sendMessage("ME")
        }
    }
});

let initialHeight = window.innerHeight

window.addEventListener("resize", function () {
    if(!isOnMobile()){        
        document.getElementById("chat_list_ui").style.display = "block"        
        document.getElementById("chat_ui").style.display = "block"        
    } else if(initialHeight !== this.window.innerHeight){
        ;
    } else {
        goToChatList()
    }
});




function setPage(){
    update_chats()
    changeChat(chats_list[0])
    if(isOnMobile()) goToChatList()
}

setPage()