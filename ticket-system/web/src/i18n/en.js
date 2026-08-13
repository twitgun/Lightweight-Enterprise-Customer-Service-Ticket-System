export default {
  app: { name: 'Customer Service Ticket System' },
  common: {
    submit: 'Submit', cancel: 'Cancel', save: 'Save', delete: 'Delete', edit: 'Edit', create: 'Create',
    search: 'Search', confirm: 'Confirm', close: 'Close', action: 'Action', status: 'Status', all: 'All',
    loading: 'Loading...', empty: 'No data', copied: 'Copied'
  },
  status: { pending: 'Pending', processing: 'Processing', waiting: 'Awaiting Confirmation', closed: 'Closed', overdue: 'Overdue' },
  priority: { low: 'Low', normal: 'Normal', high: 'High', urgent: 'Urgent' },
  channel: { web: 'Web', wechat: 'WeChat', wecom: 'WeCom', email: 'Email' },
  role: { customer: 'Customer', staff: 'Support Agent', manager: 'Support Manager' },
  menu: {
    home: 'Dashboard', newTicket: 'New Ticket', myTickets: 'My Tickets', allTickets: 'All Tickets',
    users: 'Accounts', categories: 'Categories', faqs: 'FAQ', faqManage: 'FAQ Management',
    bulletins: 'Bulletins', bulletinManage: 'Bulletin Management', phrases: 'Quick Replies', system: 'System Settings',
    channels: 'Channels', forms: 'Form Builder', ask: 'AI Assistant', logout: 'Sign Out'
  },
  login: {
    title: 'Sign In', account: 'Account', password: 'Password', submit: 'Sign In',
    register: 'Register Customer Account', demo: 'Demo accounts (password: 123456)', success: 'Signed in successfully'
  },
  register: {
    title: 'Register Customer Account', account: 'Account (3-32 letters/digits/underscore)', name: 'Name',
    password: 'Password (at least 6 chars)', confirm: 'Confirm Password', company: 'Company', phone: 'Phone',
    submit: 'Register', toLogin: 'Already have an account? Sign in'
  },
  home: {
    welcome: 'Hello', submitNew: 'New Ticket', myRecent: 'My Recent Tickets', recent: 'Recent Tickets',
    viewAll: 'View All', totalTickets: 'Total Tickets', todayNew: 'New Today', categoryDist: 'Tickets by Category',
    staffLoad: 'Agent Workload (Open Tickets)', staffPerf: 'Agent Performance', trend: 'Tickets in Last 14 Days',
    created: 'Created', closedLine: 'Closed', myProcessing: 'My Open Tickets', myClosed: 'Total Closed',
    todayClosed: 'Closed Today', overdueCount: 'Overdue', csatAvg: 'Avg CSAT', avgResponse: 'Avg Response (min)',
    avgResolve: 'Avg Resolve (hrs)', quickAsk: 'Have a question? Ask the AI assistant', quickStart: 'GO',
    staffOpen: 'Open Tickets', staffRecent: 'Latest Messages', quickReplies: 'Quick Replies'
  },
  ticket: {
    no: 'No.', title: 'Title', category: 'Category', customer: 'Customer', staff: 'Agent',
    createdAt: 'Created At', updatedAt: 'Updated At', channel: 'Channel', priority: 'Priority',
    submitNew: 'New Ticket', keyword: 'Ticket No / Title', reply: 'Reply', send: 'Send Reply',
    messages: 'Conversation', logs: 'Activity Log', operations: 'Actions', assign: 'Assign Agent', transfer: 'Transfer',
    selectStaff: 'Select agent', confirmResolved: 'Confirm Resolved & Close', markWaiting: 'Mark Awaiting Confirmation',
    continueHandle: 'Continue Handling', complete: 'Close Ticket', aiReply: 'AI Reply Suggestion', aiSummary: 'AI Summary',
    aiClassify: 'AI Classify', quickPhrase: 'Quick replies', fieldValues: 'Extra Fields',
    slaResponse: 'Response SLA', slaResolve: 'Resolve SLA', overdueWarning: 'This ticket is overdue (SLA exceeded)',
    rate: 'Satisfaction', rateNow: 'Rate Now', rateDone: 'Rated', ratePlaceholder: 'Comment (optional)',
    customerScore: 'Customer Rating', suggestion: 'AI Suggestion', noSuggest: 'No suggestion'
  },
  ask: {
    title: 'AI Assistant', placeholder: 'Ask a question, e.g. how to submit a ticket', search: 'Ask',
    matched: 'Answers found', noMatch: 'No answer found in knowledge base. Please submit a ticket for human support.',
    submitTicket: 'Submit Ticket', sourceKb: 'Knowledge Base', sourceLlm: 'AI Generated'
  },
  manager: {
    users: 'Accounts', createUser: 'New Account', role: 'Role', name: 'Name', phone: 'Phone',
    company: 'Company', enabled: 'Active', disabled: 'Disabled', resetPwd: 'Reset Password', editUser: 'Edit Account',
    categories: 'Categories', createCategory: 'New Category', sort: 'Sort', faqs: 'FAQ Management', createFaq: 'New FAQ',
    question: 'Question', answer: 'Answer', bulletins: 'Bulletin Management', createBulletin: 'New Bulletin', title: 'Title', content: 'Content',
    phrases: 'Quick Replies', createPhrase: 'New Quick Reply', system: 'System Settings', aiConfig: 'AI Assistant Settings',
    aiEnabled: 'Enable AI', aiProvider: 'Provider', aiApiUrl: 'API URL', aiApiKey: 'API Key', aiModel: 'Model',
    autoAssign: 'Auto assign tickets (least-loaded agent)', slaConfig: 'SLA Policies',
    responseHours: 'Response (hrs)', resolveHours: 'Resolve (hrs)', channels: 'Channels',
    channelName: 'Channel', channelEnabled: 'Enabled', channelConfig: 'Config (JSON)', testInbound: 'Simulate Inbound',
    forms: 'Form Builder', fieldLabel: 'Field Label', fieldType: 'Field Type', fieldRequired: 'Required',
    fieldOptions: 'Options (comma separated)', typeText: 'Text', typeTextarea: 'Textarea',
    typeSelect: 'Select', typeDate: 'Date'
  },
  notif: { title: 'Notifications', markAll: 'Mark all read', empty: 'No notifications' }
}
