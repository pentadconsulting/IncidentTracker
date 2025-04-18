
const supabaseUrl = 'https://oszxwdfbmudbgsdjykye.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zenh3ZGZibXVkYmdzZGp5a3llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5NDg4MzgsImV4cCI6MjA2MDUyNDgzOH0.hMZmZeawZPOOsK6_Sz7xW7lwcr02Q1GiEIaBxLYvMZc';
const client = supabase.createClient(supabaseUrl, supabaseKey);

// DOM elements
const form = document.getElementById('incident-form');
const tableBody = document.getElementById('incident-table-body');

document.addEventListener('DOMContentLoaded', async () => {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session || !data.session.user) {
        // Not logged in
        window.location.href = 'login.html';
        return;
      }

      // Logged in - show app
      document.getElementById('app').style.display = 'block';
      loadIncidents(); // Your function to load data
    } catch (err) {
      console.error('Auth check error:', err);
      window.location.href = 'login.html';
    }
  });
// 📝 Fetch all incidents from Supabase
async function loadIncidents() {
    const { data, error } = await client
      .from('incidents')
      .select('*')
      .order('Date', { ascending: false });
  
    if (error) {
      console.error('Error loading incidents:', error.message);
      return;
    }
  
    tableBody.innerHTML = '';
  
    data.forEach(incident => {
      const row = document.createElement('tr');
  
      ['Date', 'Team', 'Member', 'Type', 'Incident', 'Notes'].forEach(key => {
        const td = document.createElement('td');
        td.textContent = incident[key];
        row.appendChild(td);
      });
  
      // Create Actions Column
      const actionTd = document.createElement('td');
  
      const editBtn = document.createElement('button');
      editBtn.textContent = '✏️';
      editBtn.onclick = () => editIncident(incident);
      actionTd.appendChild(editBtn);
  
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '🗑️';
      deleteBtn.onclick = () => deleteIncident(incident.id);
      actionTd.appendChild(deleteBtn);
  
      row.appendChild(actionTd);
      tableBody.appendChild(row);
    });
  }
function editIncident(incident) {
    // Fill form with incident values
    form.date.value = incident.Date;
    form.team.value = incident.Team;
    form.member.value = incident.Member;
    form.type.value = incident.Type;
    form.incident.value = incident.Incident;
    form.notes.value = incident.Notes;
  
    // Save the ID so we know it’s an update
    form.dataset.editId = incident.id;
  }

  async function deleteIncident(id) {
    const confirmDelete = confirm('Are you sure you want to delete this incident?');
    if (!confirmDelete) return;
  
    const { error } = await client.from('incidents').delete().eq('id', id);
  
    if (error) {
      alert('Delete failed: ' + error.message);
      return;
    }
  
    await loadIncidents();
  }

form.addEventListener('submit', async function (e) {
    e.preventDefault();
  
    const newIncident = {
      Date: form.date.value,
      Team: form.team.value,
      Member: form.member.value,
      Type: form.type.value,
      Incident: form.incident.value,
      Notes: form.notes.value
    };
  
    const editingId = form.dataset.editId;
  
    let response;
  
    if (editingId) {
      // Edit mode
      response = await client
        .from('incidents')
        .update(newIncident)
        .eq('id', editingId);
  
      delete form.dataset.editId; // Clear edit mode
    } else {
      // Add mode
      response = await client
        .from('incidents')
        .insert([newIncident]);
    }
  
    const { error } = response;
  
    if (error) {
      alert('Failed to save incident: ' + error.message);
      return;
    }
  
    form.reset();
    await loadIncidents();
  });


loadIncidents();
