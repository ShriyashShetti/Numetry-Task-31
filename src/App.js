import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [contacts, setContacts] = useState([]);
  const [tags, setTags] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", email: "", tags: [] });
  const [filterTag, setFilterTag] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchContacts();
    fetchTags();
  }, []);

  const fetchContacts = async () => {
    const res = await axios.get("http://localhost:8080/contacts/1");
    setContacts(res.data);
  };

  const fetchTags = async () => {
    const res = await axios.get("http://localhost:8080/tags");
    setTags(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:8080/contacts/${editId}`, form);
        toast.success("Contact updated!");
      } else {
        await axios.post("http://localhost:8080/contacts", { ...form, user_id: 1 });
        toast.success("Contact added!");
      }
      setForm({ name: "", phone: "", email: "", tags: [] });
      setEditId(null);
      fetchContacts();
    } catch {
      toast.error("Something went wrong!");
    }
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:8080/contacts/${id}`);
    toast.success("Deleted!");
    fetchContacts();
  };

  const handleEdit = (contact) => {
    setEditId(contact.id);
    setForm({
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      tags: contact.tags.map(tag => tag.id),
    });
  };

  const filteredContacts = filterTag
    ? contacts.filter(contact => contact.tags.some(tag => tag.id === parseInt(filterTag)))
    : contacts;

  return (
    <div className="container py-5">
      <h2 className="text-center text-primary mb-4">📘 Contact Book with Tags</h2>
      <form className="card p-4 shadow mb-4" onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-4">
            <input required className="form-control" placeholder="Name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="col-md-4">
            <input required className="form-control" placeholder="Phone" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="col-md-4">
            <input required className="form-control" placeholder="Email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="col-12">
            <select multiple className="form-select" value={form.tags}
              onChange={(e) => setForm({ ...form, tags: Array.from(e.target.selectedOptions, o => parseInt(o.value)) })}>
              {tags.map(tag => (
                <option key={tag.id} value={tag.id}>{tag.name}</option>
              ))}
            </select>
          </div>
          <div className="col-12 d-flex justify-content-between">
            <button className="btn btn-success">{editId ? "Update" : "Add"}</button>
            <select className="form-select w-25" value={filterTag} onChange={(e) => setFilterTag(e.target.value)}>
              <option value="">All Tags</option>
              {tags.map(tag => <option key={tag.id} value={tag.id}>{tag.name}</option>)}
            </select>
          </div>
        </div>
      </form>

      <div className="row">
        {filteredContacts.map(contact => (
          <div key={contact.id} className="col-md-6 mb-3">
            <div className="card shadow-sm p-3 border-start border-4 border-primary">
              <h5>{contact.name}</h5>
              <p className="mb-1">📞 {contact.phone}</p>
              <p className="mb-1">📧 {contact.email}</p>
              <div className="mb-2">
                {contact.tags.map(tag => (
                  <span key={tag.id} className="badge bg-primary me-1">{tag.name}</span>
                ))}
              </div>
              <button className="btn btn-sm btn-outline-info me-2" onClick={() => handleEdit(contact)}>Edit</button>
              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(contact.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <ToastContainer />
    </div>
  );
}

export default App;
