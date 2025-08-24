// Predefined job fields
const fields = [
  { type: "job_title", label: "Job Title", required: true },
  { type: "company_name", label: "Company Name", required: true },
  { type: "location", label: "Location" },
  {
    type: "job_type",
    label: "Job Type",
    options: [
      { label: "Full-time", value: "full_time" },
      { label: "Part-time", value: "part_time" },
      { label: "Contract", value: "contract" },
      { label: "Internship", value: "internship" },
      { label: "Temporary", value: "temporary" },
    ],
  },
  {
    type: "experience_level",
    label: "Experience Level",
    options: [
      { label: "Entry Level", value: "entry" },
      { label: "Mid Level", value: "mid" },
      { label: "Senior Level", value: "senior" },
      { label: "Manager", value: "manager" },
      { label: "Director", value: "director" },
    ],
  },
  {
    type: "resume",
    label: "Resume (PDF, DOCX, etc.)",
    accept: ".pdf,.doc,.docx,.txt,.rtf",
  },
  {
    type: "other_files",
    label: "Other Files (optional)",
    accept: "*",
    multiple: true,
  },
  { type: "salary_range", label: "Salary Range" },
  { type: "description", label: "Job Description" },
  { type: "responsibilities", label: "Responsibilities" },
  { type: "requirements", label: "Requirements" },
  { type: "benefits", label: "Benefits" },
  { type: "application_deadline", label: "Application Deadline" },
  { type: "apply_link", label: "Apply Link" },
  { label: "Paragraph", type: "paragraph", text: "Paragraph text" },
  { label: "Spacing", type: "spacing" },
  { label: "Heading 1", type: "h1", text: "Heading 1" },
  { label: "Heading 2", type: "h2", text: "Heading 2" },
  {
    label: "Bulleted List",
    type: "list",
    listType: "ul",
    options: ["List item 1", "List item 2"],
  },
  {
    label: "Numbered List",
    type: "list",
    listType: "ol",
    options: ["List item 1", "List item 2"],
  },
  {
    type: "terms",
    label: "Terms and Conditions",
    text: "I agree to the terms and conditions.",
  }
];
