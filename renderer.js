const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const dataFile = path.join(__dirname, 'data.txt');

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("btnSaveChild").addEventListener("click", saveChildDetails);
    document.getElementById("btnFetchSolat").addEventListener("click", displayPrayerTimes);
    document.getElementById("btnReadChild").addEventListener("click", readChildDetails);
    document.getElementById("btnDeleteChild").addEventListener("click", deleteChildDetails);
    document.getElementById("btnEditChild").addEventListener("click", editChildDetails);
    loadEditDropdown();
});

async function displayPrayerTimes() {
    const solatList = document.getElementById("solatList");
    solatList.innerHTML = "";
    const selectedDate = document.getElementById("solatDate").value;
    const selectedZone = document.getElementById("solatZone").value;

    if (!selectedDate) {
        alert("Please select a date.");
        return;
    }

    try {
        const response = await fetch(`https://api.waktusolat.app/solat/${selectedZone}`);
        const data = await response.json();

        if (!data || !data.prayerTime) {
            throw new Error("Invalid API response.");
        }

        const [year, month, day] = selectedDate.split("-");
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const formattedDate = `${day}-${monthNames[parseInt(month, 10) - 1]}-${year}`;

        const prayerTimes = data.prayerTime.find(entry => entry.date === formattedDate);

        if (!prayerTimes) {
            solatList.innerHTML = `<li style="color: red;">No data available for selected date.</li>`;
            return;
        }

        document.getElementById("hijriDate").textContent = `Hijri Date: ${prayerTimes.hijri}`;
        document.getElementById("currentDay").textContent = `Day: ${prayerTimes.day}`;

        const solatKeys = { fajr: "Subuh", dhuhr: "Zohor", asr: "Asar", maghrib: "Maghrib", isha: "Isyak" };
        for (const key in solatKeys) {
            const li = document.createElement("li");
            li.textContent = `${solatKeys[key]}: ${prayerTimes[key]}`;
            solatList.appendChild(li);
        }
    } catch (error) {
        solatList.innerHTML = `<li style="color: red;">Error fetching data.</li>`;
    }
}

function saveChildDetails() {
    const name = document.getElementById("childName").value;
    const age = document.getElementById("childAge").value;
    const sunnahPrayers = document.getElementById("sunnahPrayers").value.trim(); 
    const prayers = {
        subuh: document.getElementById("subuh").checked,
        zohor: document.getElementById("zohor").checked,
        asar: document.getElementById("asar").checked,
        maghrib: document.getElementById("maghrib").checked,
        isyak: document.getElementById("isyak").checked
    };

    if (!name || !age) {
        alert("Please enter child's name and age.");
        return;
    }

    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;

    let data = [];
    if (fs.existsSync(dataFile)) {
        data = JSON.parse(fs.readFileSync(dataFile));
    }
    data.push({ name, age, prayers, sunnahPrayers: sunnahPrayers || "None", dateSaved: formattedDate });
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    alert("Child data saved successfully on " + formattedDate);
    loadEditDropdown(); 
}



function saveChildDetails() {
    const name = document.getElementById("childName").value;
    const age = document.getElementById("childAge").value;
    const sunnahPrayers = document.getElementById("sunnahPrayers").value.trim(); 
    const prayers = {
        subuh: document.getElementById("subuh").checked,
        zohor: document.getElementById("zohor").checked,
        asar: document.getElementById("asar").checked,
        maghrib: document.getElementById("maghrib").checked,
        isyak: document.getElementById("isyak").checked
    };

    if (!name || !age) {
        alert("Please enter child's name and age.");
        return;
    }

    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;

    let data = [];
    if (fs.existsSync(dataFile)) {
        data = JSON.parse(fs.readFileSync(dataFile));
    }
    data.push({ name, age, prayers,sunnahPrayers: sunnahPrayers || "None",  dateSaved: formattedDate});
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    alert("Child data saved successfully on " + formattedDate);
    loadEditDropdown(); 
}

function readChildDetails() {
    if (!fs.existsSync(dataFile)) {
        alert("No saved child data found.");
        return;
    }

    const records = JSON.parse(fs.readFileSync(dataFile));
    let displayText = records.map(record => `Name: ${record.name}\nAge: ${record.age}\nSubuh: ${record.prayers.subuh}\nZohor: ${record.prayers.zohor}\nAsar: ${record.prayers.asar}\nMaghrib: ${record.prayers.maghrib}\nIsyak: ${record.prayers.isyak}\nSunnah Prayers: ${record.sunnahPrayers}`).join("\n\n");
    alert(displayText);
}

function loadEditDropdown() {
    const dropdown = document.getElementById("editChildDropdown");
    dropdown.innerHTML = ""; 

    if (!fs.existsSync(dataFile)) {
        console.warn("data.txt not found!");
        dropdown.innerHTML = `<option disabled selected>No children available</option>`;
        return;
    }

    try {
        const text = fs.readFileSync(dataFile, "utf8"); 
        const childData = JSON.parse(text); 

        if (!Array.isArray(childData) || childData.length === 0) {
            dropdown.innerHTML = `<option disabled selected>No children available</option>`;
            return;
        }

        dropdown.innerHTML = `<option disabled selected>Select a child</option>`;

        childData.forEach((child) => {
            const option = document.createElement("option");
            option.value = child.name; 
            option.textContent = `${child.name} (Age: ${child.age})`;
            dropdown.appendChild(option);
        });

        dropdown.addEventListener("change", populateChildDetails); 
    } catch (error) {
        console.error("Error parsing JSON:", error);
    }
}

function deleteChildDetails() {
    if (fs.existsSync(dataFile)) {
        fs.unlinkSync(dataFile);
        alert("Child data deleted successfully.");
    } else {
        alert("No data found to delete.");
    }
}

function populateChildDetails() {
    const selectedChild = document.getElementById("editChildDropdown").value;
    const childInfoContainer = document.getElementById("childInfoContainer");
    
    if (!fs.existsSync(dataFile)) return;

    const childData = JSON.parse(fs.readFileSync(dataFile, "utf8"));
    const child = childData.find(c => c.name === selectedChild);

    if (!child) {
        childInfoContainer.style.display = "none"; 
        return;
    }

    document.getElementById("childNameEdit").value = child.name;
    document.getElementById("childAgeEdit").value = child.age;
    document.getElementById("sunnahPrayersEdit").value = child.sunnahPrayers;

    document.getElementById("subuhEdit").checked = child.prayers.subuh;
    document.getElementById("zohorEdit").checked = child.prayers.zohor;
    document.getElementById("asarEdit").checked = child.prayers.asar;
    document.getElementById("maghribEdit").checked = child.prayers.maghrib;
    document.getElementById("isyakEdit").checked = child.prayers.isyak;

    childInfoContainer.style.display = "block";
}

function editChildDetails() {
    const selectedChild = document.getElementById("editChildDropdown").value;
    if (!fs.existsSync(dataFile)) return;

    let childData = JSON.parse(fs.readFileSync(dataFile, "utf8"));
    const childIndex = childData.findIndex(c => c.name === selectedChild);

    if (childIndex === -1) return;

    const updatedChild = {
        name: document.getElementById("childNameEdit").value,
        age: document.getElementById("childAgeEdit").value,
        sunnahPrayers: document.getElementById("sunnahPrayersEdit").value.trim() || "None",
        prayers: {
            subuh: document.getElementById("subuhEdit").checked,
            zohor: document.getElementById("zohorEdit").checked,
            asar: document.getElementById("asarEdit").checked,
            maghrib: document.getElementById("maghribEdit").checked,
            isyak: document.getElementById("isyakEdit").checked
        }
    };

    childData[childIndex] = updatedChild;
    fs.writeFileSync(dataFile, JSON.stringify(childData, null, 2));
    
    alert("Child data updated successfully!");
    loadEditDropdown();
}