import smtplib
from email.message import EmailMessage

msg = EmailMessage()
msg.set_content('This is a test email from ExamForge deployment debugging.')
msg['Subject'] = 'Test Email'
msg['From'] = 'rajukakarlapudi5973@gmail.com'
msg['To'] = 'rajukakarlapudi5973@gmail.com'

try:
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login('rajukakarlapudi5973@gmail.com', 'qyiwkzmjagcfknkk')
    server.send_message(msg)
    server.quit()
    print("Email sent successfully!")
except Exception as e:
    print(f"Failed to send email: {e}")
