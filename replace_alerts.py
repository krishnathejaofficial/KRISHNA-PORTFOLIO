import re

with open('src/components/AdminDashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace alerts
content = content.replace("alert('✅ Availability updated!')", "showToast('Availability updated!')")
content = content.replace("alert(d.error || 'Failed to update')", "showToast(d.error || 'Failed to update', 'error')")
content = content.replace("alert('Error updating availability')", "showToast('Error updating availability', 'error')")

content = content.replace("alert('✅ Notifications enabled! You will be notified of new submissions.')", "showToast('Notifications enabled! You will be notified of new submissions.')")
content = content.replace("alert('Notifications were denied. Please allow them in browser settings.')", "showToast('Notifications were denied. Please allow them in browser settings.', 'error')")

content = content.replace("alert(d.error || 'Save failed')", "showToast(d.error || 'Save failed', 'error')")
content = content.replace("alert('Error saving testimonial')", "showToast('Error saving testimonial', 'error')")

content = content.replace("alert(d.error || 'Delete failed')", "showToast(d.error || 'Delete failed', 'error')")
content = content.replace("alert('Error deleting')", "showToast('Error deleting', 'error')")

content = content.replace("alert(`Status updated to \"${newStatus}\" & email sent!`)", "showToast(`Status updated to \"${newStatus}\" & email sent!`)")

content = content.replace("return alert('Enter reminder time and text')", "return showToast('Enter reminder time and text', 'error')")
content = content.replace("alert('Reminder set! Email sent to confirm.')", "showToast('Reminder set! Email sent to confirm.')")

content = content.replace("return alert(d.error)", "return showToast(d.error, 'error')")

content = content.replace("alert('Password reset successful! Please login with your new password.')", "showToast('Password reset successful! Please login with your new password.')")
content = content.replace("alert('Password changed successfully! Please log in again.')", "showToast('Password changed successfully! Please log in again.')")

content = content.replace("alert('✅ Notifications already enabled!')", "showToast('Notifications already enabled!')")

# Replace confirm for deleteTestimonial
del_test_old = '''  const deleteTestimonial = async (id) => {
    if (!confirm('Permanently delete this testimonial?')) return;
    try {
      const r = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', token, id })
      });
      const d = await r.json();
      if (d.success) fetchTestimonials();
      else alert(d.error || 'Delete failed');
    } catch (e) { alert('Error deleting'); }
  };'''

del_test_new = '''  const deleteTestimonial = async (id) => {
    confirmAction('Permanently delete this testimonial?', async () => {
      try {
        const r = await fetch('/api/testimonials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', token, id })
        });
        const d = await r.json();
        if (d.success) fetchTestimonials();
        else showToast(d.error || 'Delete failed', 'error');
      } catch (e) { showToast('Error deleting', 'error'); }
    });
  };'''
content = content.replace(del_test_old, del_test_new)

# Replace confirm for deleteSubmission
del_sub_old = '''  const deleteSubmission = async (trackingId) => {
    if (!confirm('Permanently delete this request?')) return;
    const d = await api({ action: 'delete-submission', trackingId });
    if (d.success) fetchSubmissions();
  };'''
del_sub_new = '''  const deleteSubmission = async (trackingId) => {
    confirmAction('Permanently delete this request?', async () => {
      const d = await api({ action: 'delete-submission', trackingId });
      if (d.success) fetchSubmissions();
    });
  };'''
content = content.replace(del_sub_old, del_sub_new)

# Replace confirm for deleteReminder
del_rem_old = '''  const deleteReminder = async (id) => {
    if (!confirm('Delete this reminder?')) return;
    const d = await api({ action: 'delete-reminder', id });
    if (d.success) fetchReminders();
  };'''
del_rem_new = '''  const deleteReminder = async (id) => {
    confirmAction('Delete this reminder?', async () => {
      const d = await api({ action: 'delete-reminder', id });
      if (d.success) fetchReminders();
    });
  };'''
content = content.replace(del_rem_old, del_rem_new)

# Replace confirm for deleteWeekly
del_week_old = '''  const deleteWeekly = async (day, start, end) => {
    if (!confirm('Delete this recurring time block?')) return;
    const d = await api({ action: 'delete-weekly', day, start, end });
    if (d.success) fetchWeeklyTimetable();
  };'''
del_week_new = '''  const deleteWeekly = async (day, start, end) => {
    confirmAction('Delete this recurring time block?', async () => {
      const d = await api({ action: 'delete-weekly', day, start, end });
      if (d.success) fetchWeeklyTimetable();
    });
  };'''
content = content.replace(del_week_old, del_week_new)

with open('src/components/AdminDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
