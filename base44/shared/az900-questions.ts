// Original AZ-900 practice questions. Correct answers are stored separately (AnswerKey)
// and only released through server-side grading.

export type SeedQuestion = {
  topic_slug: string;
  type: "single" | "multiple";
  text: string;
  options: string[];
  correct: number[];
  explanation: string;
  distractors?: string;
  difficulty: "easy" | "medium" | "hard";
  objective: string;
  source: string;
};

const CLOUD = "https://learn.microsoft.com/en-us/training/paths/az-900-describe-cloud-concepts/";
const ARCH = "https://learn.microsoft.com/en-us/training/paths/az-900-describe-azure-architecture-services/";
const GOV = "https://learn.microsoft.com/en-us/training/paths/az-900-describe-azure-management-governance/";

export const QUESTIONS: SeedQuestion[] = [
  // ── Topic 1: cloud fundamentals ───────────────────────────────────────────
  {
    topic_slug: "cloud-fundamentals",
    type: "single",
    text: "Under the shared responsibility model, which responsibility always remains with the customer regardless of the cloud service model?",
    options: [
      "Securing the physical datacentre",
      "Protecting information, accounts and identities",
      "Maintaining the hypervisor",
      "Replacing failed physical network hardware",
    ],
    correct: [1],
    explanation:
      "Data, accounts, identities and devices stay with the customer in every model — IaaS, PaaS and SaaS. The provider is responsible for the physical platform.",
    distractors:
      "The datacentre, hypervisor and physical network are Microsoft's responsibility in a public cloud offering.",
    difficulty: "easy",
    objective: "Identify the responsibilities that always stay with the customer",
    source: CLOUD,
  },
  {
    topic_slug: "cloud-fundamentals",
    type: "single",
    text: "A company keeps its patient records in its own datacentre and runs a new appointment booking app in Azure. Which cloud model is described?",
    options: ["Public cloud", "Private cloud", "Hybrid cloud", "Multi-cloud"],
    correct: [2],
    explanation:
      "Hybrid cloud combines a private environment (the on-premises datacentre) with public cloud services, which is exactly what this arrangement does.",
    distractors:
      "Public cloud alone would host everything with the provider; private cloud would keep everything dedicated to the organisation; multi-cloud requires two or more public providers.",
    difficulty: "easy",
    objective: "Compare public, private and hybrid cloud deployment models",
    source: CLOUD,
  },
  {
    topic_slug: "cloud-fundamentals",
    type: "single",
    text: "Which statement best describes a consumption-based model?",
    options: [
      "Capacity is purchased in advance and owned by the organisation",
      "You are billed only for the resources you use, for the time you use them",
      "A fixed annual licence covers unlimited usage",
      "Costs are based on the number of employees in the organisation",
    ],
    correct: [1],
    explanation:
      "Consumption-based billing meters actual usage, which shifts spend from capital expenditure to operating expenditure.",
    distractors:
      "Buying capacity in advance is the traditional on-premises CapEx model; the other options describe licence arrangements, not cloud consumption.",
    difficulty: "easy",
    objective: "Define cloud computing and the consumption-based model",
    source: CLOUD,
  },
  {
    topic_slug: "cloud-fundamentals",
    type: "multiple",
    text: "Which two outcomes typically follow from moving from capital expenditure to operating expenditure? Select two.",
    options: [
      "Large upfront hardware purchases are avoided",
      "Costs track actual usage rather than forecast capacity",
      "The organisation no longer needs to secure its own data",
      "Monthly costs become identical every month",
    ],
    correct: [0, 1],
    explanation:
      "OpEx means no large upfront purchase and costs that follow consumption. Responsibility for data security never transfers to the provider, and consumption-based billing varies with usage.",
    distractors:
      "Data security stays with the customer, and usage-based billing is by definition not fixed.",
    difficulty: "medium",
    objective: "Define cloud computing and the consumption-based model",
    source: CLOUD,
  },

  // ── Topic 2: models, consumption, pricing ─────────────────────────────────
  {
    topic_slug: "cloud-models-consumption",
    type: "single",
    text: "An organisation uses Azure for its data platform and a second public cloud provider for its mobile backend. What is this called?",
    options: ["Hybrid cloud", "Multi-cloud", "Private cloud", "Edge computing"],
    correct: [1],
    explanation:
      "Multi-cloud means using more than one public cloud provider. Hybrid cloud specifically combines public and private environments.",
    distractors:
      "Hybrid involves a private component; private cloud is dedicated to one organisation; edge computing concerns where processing happens, not how many providers are used.",
    difficulty: "easy",
    objective: "Distinguish public, private, hybrid and multi-cloud",
    source: CLOUD,
  },
  {
    topic_slug: "cloud-models-consumption",
    type: "single",
    text: "A team commits to a three-year term for a virtual machine that runs continuously, in exchange for a lower hourly rate. Which pricing option is this?",
    options: ["Pay-as-you-go", "Spot pricing", "Reserved capacity", "Free tier"],
    correct: [2],
    explanation:
      "Reserved capacity trades a one- or three-year commitment for a discounted rate, and suits predictable, sustained workloads.",
    distractors:
      "Pay-as-you-go has no commitment; spot capacity can be reclaimed by Azure at short notice; the free tier covers limited introductory usage.",
    difficulty: "medium",
    objective: "Explain consumption-based pricing, reservations and spot pricing",
    source: CLOUD,
  },
  {
    topic_slug: "cloud-models-consumption",
    type: "single",
    text: "Which statement about a private cloud is correct?",
    options: [
      "It is always hosted by a third-party public provider",
      "The cloud infrastructure is dedicated to a single organisation",
      "It cannot use virtualisation",
      "It never requires an internet connection",
    ],
    correct: [1],
    explanation:
      "A private cloud is provisioned for exclusive use by one organisation. It may be hosted on-premises or by a third party, but the infrastructure is not shared with other tenants.",
    distractors:
      "A private cloud can be hosted off-site, relies on virtualisation, and may still be reached over private or public networks depending on design.",
    difficulty: "medium",
    objective: "Distinguish public, private, hybrid and multi-cloud",
    source: CLOUD,
  },
  {
    topic_slug: "cloud-models-consumption",
    type: "multiple",
    text: "Which two are characteristics of public cloud? Select two.",
    options: [
      "The provider manages the underlying physical infrastructure",
      "Resources are shared among many customers",
      "All hardware is owned by the customer",
      "The customer must patch the hypervisor",
    ],
    correct: [0, 1],
    explanation:
      "In public cloud the provider owns and operates the platform and serves multiple customers on shared infrastructure, logically isolated per tenant.",
    distractors:
      "Customers do not own the hardware and never patch the provider's hypervisor.",
    difficulty: "easy",
    objective: "Distinguish public, private, hybrid and multi-cloud",
    source: CLOUD,
  },

  // ── Topic 3: benefits ────────────────────────────────────────────────────
  {
    topic_slug: "cloud-benefits",
    type: "single",
    text: "Adding three more web servers behind a load balancer to handle increased demand is an example of which approach?",
    options: ["Vertical scaling", "Horizontal scaling", "Disaster recovery", "Geo-replication"],
    correct: [1],
    explanation:
      "Adding more instances is horizontal scaling (scaling out). Vertical scaling would mean moving to a larger single machine.",
    distractors:
      "Vertical scaling increases the size of one machine; disaster recovery and geo-replication address failure and geography, not capacity.",
    difficulty: "easy",
    objective: "Differentiate vertical from horizontal scaling",
    source: CLOUD,
  },
  {
    topic_slug: "cloud-benefits",
    type: "single",
    text: "A student portal keeps working when one datacentre fails because it runs across three availability zones. Which benefit does this demonstrate?",
    options: ["Elasticity", "High availability", "Predictability", "Manageability"],
    correct: [1],
    explanation:
      "High availability is about minimising downtime and staying operational through failures. Spreading across zones removes a single point of failure.",
    distractors:
      "Elasticity is automatic scaling with demand; predictability concerns consistent performance and cost; manageability concerns ease of administration.",
    difficulty: "easy",
    objective: "Distinguish high availability, scalability and elasticity",
    source: CLOUD,
  },
  {
    topic_slug: "cloud-benefits",
    type: "single",
    text: "Which statement describes elasticity?",
    options: [
      "Resources are automatically added or removed to match current demand",
      "Resources are permanently sized for peak load",
      "A second region is kept in sync for disaster recovery",
      "The bill is fixed for the duration of a contract",
    ],
    correct: [0],
    explanation:
      "Elasticity is automatic, demand-driven scaling — capacity follows load in both directions.",
    distractors:
      "Sizing permanently for peak load is over-provisioning; a standby region is disaster recovery; fixed billing is not consumption-based.",
    difficulty: "medium",
    objective: "Distinguish high availability, scalability and elasticity",
    source: CLOUD,
  },
  {
    topic_slug: "cloud-benefits",
    type: "multiple",
    text: "Which two are benefits of cloud services? Select two.",
    options: [
      "Global reach without building datacentres in every market",
      "Automatic scaling to match demand",
      "Removal of the need to manage identities",
      "Elimination of all outages",
    ],
    correct: [0, 1],
    explanation:
      "Cloud providers offer regional presence and elastic capacity. Identity management remains a customer responsibility, and no platform eliminates every outage.",
    distractors:
      "Identities stay with the customer under the shared responsibility model; high availability reduces downtime but does not remove the possibility of failure.",
    difficulty: "medium",
    objective: "Explain reliability, predictability and manageability benefits",
    source: CLOUD,
  },

  // ── Topic 4: service types ───────────────────────────────────────────────
  {
    topic_slug: "cloud-service-types",
    type: "single",
    text: "A team must install a specific database engine and configure its operating system. Which service type gives them the control they need?",
    options: ["Software as a service (SaaS)", "Platform as a service (PaaS)", "Infrastructure as a service (IaaS)", "Function as a service (FaaS)"],
    correct: [2],
    explanation:
      "IaaS provides virtual machines where the customer manages the operating system and everything above it, including the database engine.",
    distractors:
      "PaaS and FaaS abstract the operating system, and SaaS provides a finished application — none of them allow OS-level control.",
    difficulty: "easy",
    objective: "Choose the appropriate service type for a scenario",
    source: CLOUD,
  },
  {
    topic_slug: "cloud-service-types",
    type: "single",
    text: "A development team wants to deploy code without provisioning or patching servers. Which service type is the best fit?",
    options: ["IaaS", "PaaS", "SaaS", "Virtual desktop infrastructure"],
    correct: [1],
    explanation:
      "PaaS manages the operating system, runtime and scaling platform, so the team focuses on code and data.",
    distractors:
      "IaaS requires server management; SaaS is a finished product the team does not develop; VDI provides desktops, not an application platform.",
    difficulty: "easy",
    objective: "Describe IaaS, PaaS and SaaS",
    source: CLOUD,
  },
  {
    topic_slug: "cloud-service-types",
    type: "single",
    text: "Which of these is an example of software as a service?",
    options: [
      "An Azure virtual machine running Linux",
      "Azure App Service hosting an API you wrote",
      "Microsoft 365 with hosted email and documents",
      "An Azure Storage account holding backups",
    ],
    correct: [2],
    explanation:
      "Microsoft 365 is a complete application delivered over the internet — the customer only manages users and their data.",
    distractors:
      "A virtual machine is IaaS, App Service is PaaS, and a storage account is a platform service rather than a finished application.",
    difficulty: "easy",
    objective: "Choose the appropriate service type for a scenario",
    source: CLOUD,
  },
  {
    topic_slug: "cloud-service-types",
    type: "multiple",
    text: "In a platform as a service offering, which two are managed by the provider? Select two.",
    options: [
      "The operating system and runtime",
      "Scaling of the hosting platform",
      "The application code",
      "The customer's data",
    ],
    correct: [0, 1],
    explanation:
      "PaaS providers manage the operating system, runtime and platform scaling; the customer remains responsible for application code and data.",
    distractors:
      "Code and data are always authored and governed by the customer, in every service type.",
    difficulty: "medium",
    objective: "Identify what the customer manages in each model",
    source: CLOUD,
  },

  // ── Topic 5: architecture ────────────────────────────────────────────────
  {
    topic_slug: "azure-architecture-core",
    type: "single",
    text: "Which sequence shows the Azure resource hierarchy from the broadest scope to the narrowest?",
    options: [
      "Subscription → management group → resource group → resource",
      "Management group → subscription → resource group → resource",
      "Resource group → subscription → management group → resource",
      "Management group → resource group → subscription → resource",
    ],
    correct: [1],
    explanation:
      "Management groups contain subscriptions, subscriptions contain resource groups, and resource groups contain resources. Policy and access inherit downward.",
    distractors:
      "The other orders invert one or more levels, which would break inherited governance.",
    difficulty: "medium",
    objective: "Explain the resource hierarchy from management groups to resources",
    source: ARCH,
  },
  {
    topic_slug: "azure-architecture-core",
    type: "single",
    text: "What is the main purpose of an availability zone?",
    options: [
      "To reduce the cost of outbound data transfer",
      "To provide physically separate datacentres within a region for resilience",
      "To define the billing currency for a subscription",
      "To connect an on-premises network to Azure over a private circuit",
    ],
    correct: [1],
    explanation:
      "Availability zones are physically separate locations within a region with independent power, cooling and networking, so one zone's failure does not take down the others.",
    distractors:
      "Cost, billing and private connectivity are handled by other features — pricing rules, subscriptions and ExpressRoute.",
    difficulty: "easy",
    objective: "Describe regions, availability zones and region pairs",
    source: ARCH,
  },
  {
    topic_slug: "azure-architecture-core",
    type: "single",
    text: "Which benefit is associated with region pairs?",
    options: [
      "Both regions in the pair receive platform updates at exactly the same time",
      "Platform updates roll out sequentially, and the pair supports disaster recovery in the same geography",
      "Region pairs share a single datacentre to reduce latency",
      "Region pairs remove the need for data replication",
    ],
    correct: [1],
    explanation:
      "Paired regions are in the same geography, are separated geographically, and are updated one after the other to reduce the chance both are affected simultaneously. They also support disaster recovery.",
    distractors:
      "Simultaneous updates are exactly what pairing avoids; each region has its own datacentres; replication is still required.",
    difficulty: "hard",
    objective: "Describe regions, availability zones and region pairs",
    source: ARCH,
  },
  {
    topic_slug: "azure-architecture-core",
    type: "multiple",
    text: "Which two statements about resource groups are correct? Select two.",
    options: [
      "A resource can belong to only one resource group at a time",
      "Deleting a resource group deletes the resources inside it",
      "Resource groups can be nested inside other resource groups",
      "A resource group can span multiple subscriptions",
    ],
    correct: [0, 1],
    explanation:
      "Each resource has exactly one resource group, and deleting the group deletes its contents. Resource groups belong to a single subscription and cannot be nested.",
    distractors:
      "Nesting is not supported, and a resource group belongs to one subscription only.",
    difficulty: "medium",
    objective: "Apply resource group rules correctly",
    source: ARCH,
  },

  // ── Topic 6: compute ─────────────────────────────────────────────────────
  {
    topic_slug: "azure-compute",
    type: "single",
    text: "A team needs code to run whenever a new image is uploaded, without keeping any server running between uploads. Which service fits best?",
    options: ["Azure Virtual Machines", "Azure Functions", "Azure Virtual Desktop", "Azure Files"],
    correct: [1],
    explanation:
      "Azure Functions is event-driven serverless compute: code runs in response to a trigger and there is nothing to pay for while idle.",
    distractors:
      "Virtual machines run continuously and must be managed; Virtual Desktop provides desktops; Files is a storage service.",
    difficulty: "easy",
    objective: "Match compute services to workload requirements",
    source: ARCH,
  },
  {
    topic_slug: "azure-compute",
    type: "single",
    text: "A workload uses ten identical virtual machines and must add or remove instances automatically as demand changes. Which service should be used?",
    options: ["Availability set", "Virtual machine scale set", "Azure Container Instances", "Azure Bastion"],
    correct: [1],
    explanation:
      "Scale sets manage groups of identical, load-balanced VMs and can autoscale based on demand or schedule.",
    distractors:
      "Availability sets improve resilience within a datacentre but do not autoscale; Container Instances runs containers; Bastion provides secure remote access.",
    difficulty: "medium",
    objective: "Explain scale sets and availability sets",
    source: ARCH,
  },
  {
    topic_slug: "azure-compute",
    type: "single",
    text: "Which service provides managed Kubernetes orchestration in Azure?",
    options: ["Azure Kubernetes Service", "Azure Container Instances", "Azure App Service", "Azure Functions"],
    correct: [0],
    explanation:
      "Azure Kubernetes Service (AKS) is the managed Kubernetes offering, handling control-plane operations while you run containerised workloads.",
    distractors:
      "Container Instances runs individual containers without orchestration; App Service hosts web apps; Functions runs event-driven code.",
    difficulty: "easy",
    objective: "Distinguish containers from virtual machines",
    source: ARCH,
  },
  {
    topic_slug: "azure-compute",
    type: "multiple",
    text: "Which two capabilities does Azure App Service provide? Select two.",
    options: [
      "Managed hosting for web apps and APIs",
      "Deployment slots for staging and swapping",
      "Full control of the host operating system kernel",
      "Persistent remote desktop sessions for users",
    ],
    correct: [0, 1],
    explanation:
      "App Service is managed PaaS hosting for web workloads, with features such as deployment slots, autoscale and built-in authentication. It does not expose the host OS.",
    distractors:
      "Kernel access requires IaaS, and remote desktop sessions are a Virtual Desktop scenario.",
    difficulty: "medium",
    objective: "Match compute services to workload requirements",
    source: ARCH,
  },

  // ── Topic 7: networking ──────────────────────────────────────────────────
  {
    topic_slug: "azure-networking",
    type: "single",
    text: "A bank requires a private, dedicated connection from its datacentre to Azure that does not traverse the public internet. Which service meets the requirement?",
    options: ["Site-to-site VPN", "Azure ExpressRoute", "VNet peering", "Azure DNS"],
    correct: [1],
    explanation:
      "ExpressRoute provides a private connection through a connectivity provider that bypasses the public internet.",
    distractors:
      "A VPN is encrypted but runs over the internet; peering connects virtual networks inside Azure; DNS resolves names.",
    difficulty: "easy",
    objective: "Compare VPN Gateway with ExpressRoute",
    source: ARCH,
  },
  {
    topic_slug: "azure-networking",
    type: "single",
    text: "Two virtual networks in Azure need to exchange traffic privately without a gateway. What should be configured?",
    options: ["VNet peering", "A public IP address on each VM", "An ExpressRoute circuit", "A network security group"],
    correct: [0],
    explanation:
      "VNet peering connects virtual networks over Microsoft's backbone, with no gateway and no public internet exposure.",
    distractors:
      "Public IPs expose resources; ExpressRoute connects on-premises networks; a network security group filters traffic but does not connect networks.",
    difficulty: "medium",
    objective: "Describe virtual networks and subnets",
    source: ARCH,
  },
  {
    topic_slug: "azure-networking",
    type: "single",
    text: "Which statement about a site-to-site VPN connection is correct?",
    options: [
      "It requires a dedicated private circuit from a provider",
      "It sends encrypted traffic over the public internet",
      "It only works between two virtual networks in Azure",
      "It removes the need for a gateway subnet",
    ],
    correct: [1],
    explanation:
      "A VPN gateway creates an encrypted tunnel across the public internet. ExpressRoute is the dedicated-circuit alternative.",
    distractors:
      "Dedicated circuits are ExpressRoute; VNet-to-VNet links are peering; a gateway subnet is required for a VPN gateway.",
    difficulty: "medium",
    objective: "Compare VPN Gateway with ExpressRoute",
    source: ARCH,
  },
  {
    topic_slug: "azure-networking",
    type: "multiple",
    text: "Which two are benefits of using a private endpoint for a PaaS service? Select two.",
    options: [
      "Traffic to the service stays on the private network",
      "The service can be reached without exposing a public endpoint",
      "It removes the need for any access control",
      "It guarantees the service is free of charge",
    ],
    correct: [0, 1],
    explanation:
      "A private endpoint gives the PaaS service a private IP inside your VNet, so access can be restricted to your network without public exposure.",
    distractors:
      "Access control is still required, and private endpoints do not change service pricing.",
    difficulty: "hard",
    objective: "Explain private endpoints for PaaS services",
    source: ARCH,
  },

  // ── Topic 8: storage ─────────────────────────────────────────────────────
  {
    topic_slug: "azure-storage",
    type: "single",
    text: "Which redundancy option replicates data to a secondary Azure region?",
    options: ["Locally redundant storage (LRS)", "Zone-redundant storage (ZRS)", "Geo-redundant storage (GRS)", "Single-copy storage"],
    correct: [2],
    explanation:
      "GRS keeps three copies in the primary region and replicates asynchronously to a secondary region hundreds of miles away.",
    distractors:
      "LRS stays in one datacentre, ZRS spans zones within one region, and there is no single-copy option for durable storage.",
    difficulty: "medium",
    objective: "Explain LRS, ZRS, GRS and RA-GRS",
    source: ARCH,
  },
  {
    topic_slug: "azure-storage",
    type: "single",
    text: "A reporting system must read data from the secondary region during a primary-region outage. Which option should be chosen?",
    options: ["LRS", "ZRS", "GRS", "RA-GRS"],
    correct: [3],
    explanation:
      "Read-access geo-redundant storage (RA-GRS) adds read access to the secondary region copy; plain GRS keeps it unavailable until a failover.",
    distractors:
      "LRS and ZRS do not replicate to another region; GRS replicates but does not permit reads from the secondary copy.",
    difficulty: "hard",
    objective: "Explain LRS, ZRS, GRS and RA-GRS",
    source: ARCH,
  },
  {
    topic_slug: "azure-storage",
    type: "single",
    text: "A legacy application needs a shared folder it can mount using SMB. Which Azure storage service fits?",
    options: ["Blob storage", "Azure Files", "Queue storage", "Table storage"],
    correct: [1],
    explanation:
      "Azure Files provides managed SMB and NFS file shares that can be mounted like a network drive.",
    distractors:
      "Blob storage is object storage over HTTP, queues carry messages, and tables hold structured NoSQL data.",
    difficulty: "easy",
    objective: "Choose the right storage service for a data shape",
    source: ARCH,
  },
  {
    topic_slug: "azure-storage",
    type: "multiple",
    text: "Which two tools are appropriate for moving data into Azure storage? Select two.",
    options: [
      "AzCopy for scripted online copies",
      "Azure Data Box for very large offline transfers",
      "Azure Advisor for migrating file shares",
      "Azure Policy for copying blobs between regions",
    ],
    correct: [0, 1],
    explanation:
      "AzCopy handles scripted online transfers, and Data Box ships a physical appliance when the network cannot carry the volume. Azure Migrate and File Sync cover other migration scenarios.",
    distractors:
      "Advisor makes recommendations and Policy enforces rules; neither moves data.",
    difficulty: "medium",
    objective: "Select an appropriate data migration tool",
    source: ARCH,
  },

  // ── Topic 9: identity ────────────────────────────────────────────────────
  {
    topic_slug: "azure-identity",
    type: "single",
    text: "Which service provides cloud-based identity and access management for Azure and Microsoft 365?",
    options: ["Microsoft Entra ID", "Azure Policy", "Microsoft Defender for Cloud", "Azure Key Vault"],
    correct: [0],
    explanation:
      "Microsoft Entra ID (formerly Azure Active Directory) is the identity provider for users, groups and applications.",
    distractors:
      "Policy enforces resource rules, Defender for Cloud provides security posture management, and Key Vault stores secrets.",
    difficulty: "easy",
    objective: "Describe Microsoft Entra ID and its core features",
    source: ARCH,
  },
  {
    topic_slug: "azure-identity",
    type: "single",
    text: "What does role-based access control (RBAC) determine?",
    options: [
      "Whether a sign-in is allowed from a new country",
      "Which actions a principal can perform on a scope",
      "How often passwords must be rotated",
      "Which resources are replicated to a secondary region",
    ],
    correct: [1],
    explanation:
      "RBAC assigns roles at a scope (management group, subscription, resource group or resource) and controls what actions are permitted there.",
    distractors:
      "Location-based sign-in decisions belong to Conditional Access; password policy and replication are separate settings.",
    difficulty: "medium",
    objective: "Distinguish RBAC from conditional access, and B2B from B2C",
    source: ARCH,
  },
  {
    topic_slug: "azure-identity",
    type: "single",
    text: "A company wants suppliers to access internal resources using their own work credentials. Which Entra ID capability applies?",
    options: ["Business-to-business (B2B) collaboration", "Business-to-consumer (B2C)", "Privileged Identity Management", "Self-service password reset"],
    correct: [0],
    explanation:
      "B2B collaboration invites external partners as guests who sign in with their own credentials while you control their access.",
    distractors:
      "B2C serves consumers of your own applications; PIM governs temporary elevation of admin roles; SSPR lets users reset their own passwords.",
    difficulty: "medium",
    objective: "Distinguish RBAC from conditional access, and B2B from B2C",
    source: ARCH,
  },
  {
    topic_slug: "azure-identity",
    type: "multiple",
    text: "Which two are passwordless authentication methods in Microsoft Entra ID? Select two.",
    options: [
      "Microsoft Authenticator sign-in approval",
      "FIDO2 security keys",
      "A shared department password",
      "Security questions",
    ],
    correct: [0, 1],
    explanation:
      "Passwordless methods include the Microsoft Authenticator app, FIDO2 security keys and Windows Hello for Business.",
    distractors:
      "Shared passwords are poor practice and not passwordless; security questions are a recovery mechanism, not passwordless authentication.",
    difficulty: "medium",
    objective: "Explain MFA, passwordless and conditional access",
    source: ARCH,
  },

  // ── Topic 10: cost ───────────────────────────────────────────────────────
  {
    topic_slug: "azure-cost-management",
    type: "single",
    text: "A team wants to estimate the monthly cost of a planned Azure deployment before building it. Which tool should they use?",
    options: [
      "Microsoft Cost Management",
      "Azure Pricing calculator",
      "Total Cost of Ownership (TCO) calculator",
      "Azure Advisor",
    ],
    correct: [1],
    explanation:
      "The pricing calculator estimates the cost of the Azure resources you plan to deploy, using current prices for a chosen region.",
    distractors:
      "Cost Management analyses existing spend; the TCO calculator compares on-premises cost with Azure; Advisor gives optimisation recommendations.",
    difficulty: "easy",
    objective: "Distinguish the pricing calculator from the TCO calculator",
    source: GOV,
  },
  {
    topic_slug: "azure-cost-management",
    type: "single",
    text: "A company wants to compare the cost of running its current datacentre with an equivalent Azure solution. Which tool is designed for this?",
    options: ["Pricing calculator", "TCO calculator", "Azure Monitor", "Cost analysis"],
    correct: [1],
    explanation:
      "The Total Cost of Ownership calculator models on-premises costs — hardware, power, labour — against an equivalent Azure deployment.",
    distractors:
      "The pricing calculator prices Azure resources only; Monitor and cost analysis report on resources that already exist.",
    difficulty: "medium",
    objective: "Distinguish the pricing calculator from the TCO calculator",
    source: GOV,
  },
  {
    topic_slug: "azure-cost-management",
    type: "single",
    text: "Which practice makes it possible to split an Azure bill by department?",
    options: [
      "Applying consistent tags to resources",
      "Enabling geo-redundant storage",
      "Creating an availability set",
      "Using a resource lock",
    ],
    correct: [0],
    explanation:
      "Tags such as cost-center or owner are metadata you can filter and group by in Cost Management reports.",
    distractors:
      "Redundancy, availability sets and locks affect resilience, not cost allocation.",
    difficulty: "easy",
    objective: "Use Cost Management, budgets and tags to control spend",
    source: GOV,
  },
  {
    topic_slug: "azure-cost-management",
    type: "multiple",
    text: "Which two factors directly affect the cost of an Azure virtual machine? Select two.",
    options: [
      "The region it runs in",
      "How long it runs",
      "The number of users in the subscription",
      "The colour scheme of the dashboard",
    ],
    correct: [0, 1],
    explanation:
      "Pricing varies by region and by metered usage — a VM that runs for 40 hours costs less than one that runs all month, all else being equal.",
    distractors:
      "User count and interface preferences have no effect on compute pricing.",
    difficulty: "easy",
    objective: "Identify factors that affect Azure costs",
    source: GOV,
  },

  // ── Topic 11: governance ─────────────────────────────────────────────────
  {
    topic_slug: "azure-governance",
    type: "single",
    text: "An organisation must prevent anyone from creating storage accounts outside two approved regions. Which service should be used?",
    options: ["Azure Policy", "Azure Advisor", "Network security groups", "Microsoft Purview"],
    correct: [0],
    explanation:
      "Azure Policy evaluates resource requests against rules and can deny non-compliant deployments, such as a disallowed region.",
    distractors:
      "Advisor recommends, network security groups filter traffic, and Purview governs data — none of them blocks resource creation.",
    difficulty: "medium",
    objective: "Describe Azure Policy and initiatives",
    source: GOV,
  },
  {
    topic_slug: "azure-governance",
    type: "single",
    text: "A team must be able to modify a production database but must never be able to delete it. Which lock should be applied?",
    options: ["ReadOnly", "CanNotDelete", "Delete-protected policy", "No lock is needed"],
    correct: [1],
    explanation:
      "CanNotDelete permits reading and modifying a resource while blocking deletion. ReadOnly would prevent the modifications too.",
    distractors:
      "ReadOnly blocks all writes; Azure relies on resource locks (or policies) rather than a 'delete-protected policy' for this behaviour.",
    difficulty: "medium",
    objective: "Explain resource locks and when to use each type",
    source: GOV,
  },
  {
    topic_slug: "azure-governance",
    type: "single",
    text: "What is an Azure Policy initiative?",
    options: [
      "A group of policy definitions assigned together as one unit",
      "A script that deploys resources to multiple regions",
      "A cost alert threshold",
      "A role assignment for administrators",
    ],
    correct: [0],
    explanation:
      "An initiative (policy set) bundles several policy definitions so they can be assigned and tracked as a single compliance goal.",
    distractors:
      "Deployment scripts are infrastructure as code; cost alerts belong to Cost Management; role assignments belong to RBAC.",
    difficulty: "medium",
    objective: "Describe Azure Policy and initiatives",
    source: GOV,
  },
  {
    topic_slug: "azure-governance",
    type: "multiple",
    text: "Which two statements about resource locks are correct? Select two.",
    options: [
      "Locks apply even to users with Owner role permissions",
      "A ReadOnly lock prevents both changes and deletion",
      "Locks only apply to storage accounts",
      "Locks automatically delete non-compliant resources",
    ],
    correct: [0, 1],
    explanation:
      "Locks are independent of RBAC — even Owners must remove a lock before deleting — and ReadOnly blocks all writes and deletes.",
    distractors:
      "Locks apply to any supported resource, and they prevent actions rather than deleting resources.",
    difficulty: "hard",
    objective: "Explain resource locks and when to use each type",
    source: GOV,
  },

  // ── Topic 12: monitoring ─────────────────────────────────────────────────
  {
    topic_slug: "azure-monitoring",
    type: "single",
    text: "A team wants personalised recommendations to reduce cost and improve the reliability of their Azure resources. Which service provides this?",
    options: ["Azure Advisor", "Azure Service Health", "Azure Monitor", "Microsoft Purview"],
    correct: [0],
    explanation:
      "Azure Advisor analyses your configuration and usage and recommends improvements across cost, security, reliability, performance and operational excellence.",
    distractors:
      "Service Health covers platform incidents, Monitor collects metrics and logs, and Purview governs data.",
    difficulty: "easy",
    objective: "Distinguish Azure Advisor from Azure Service Health",
    source: GOV,
  },
  {
    topic_slug: "azure-monitoring",
    type: "single",
    text: "Which service tells you about an Azure outage or planned maintenance affecting the services you use?",
    options: ["Azure Advisor", "Azure Service Health", "Application Insights", "Azure Policy"],
    correct: [1],
    explanation:
      "Service Health reports incidents, planned maintenance, health advisories and security advisories scoped to your subscriptions and regions.",
    distractors:
      "Advisor recommends configuration changes, Application Insights monitors your app, and Policy enforces rules.",
    difficulty: "easy",
    objective: "Distinguish Azure Advisor from Azure Service Health",
    source: GOV,
  },
  {
    topic_slug: "azure-monitoring",
    type: "single",
    text: "A team needs to trace slow requests inside their web application, including dependencies and failures. Which tool fits best?",
    options: ["Application Insights", "Azure Service Health", "Azure Cost Management", "Network Watcher"],
    correct: [0],
    explanation:
      "Application Insights is the application performance monitoring feature of Azure Monitor, covering request rates, response times, failures and distributed traces.",
    distractors:
      "Service Health reports platform events, Cost Management reports spend, and Network Watcher diagnoses network-level issues.",
    difficulty: "medium",
    objective: "Describe Azure Monitor, Log Analytics and Application Insights",
    source: GOV,
  },
  {
    topic_slug: "azure-monitoring",
    type: "multiple",
    text: "Which two are components or capabilities of Azure Monitor? Select two.",
    options: [
      "Metrics and logs collected from resources",
      "Alert rules that notify when a condition is met",
      "Role assignments for subscription access",
      "Resource locks that prevent deletion",
    ],
    correct: [0, 1],
    explanation:
      "Azure Monitor collects metrics and logs, stores them for query in Log Analytics, visualises them, and raises alerts on the conditions you define.",
    distractors:
      "Role assignments and resource locks are governance controls, not monitoring.",
    difficulty: "medium",
    objective: "Describe Azure Monitor, Log Analytics and Application Insights",
    source: GOV,
  },
];