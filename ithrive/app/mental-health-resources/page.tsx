import Resource from "@/app/ui/resource";

const resources = [
  {
    title: "988 Suicide & Crisis Lifeline",
    description: "The 988 Lifeline is a nationwide network of local crisis centers offering free and confidential emotional support to individuals experiencing suicidal crises or emotional distress, available 24/7 across the U.S.",
    image: "/resources/988lifeline.png",
    link: "https://988lifeline.org"
  },
  {
    title: "Depression and Bipolar Support Alliance (DBSA)",
    description: "DBSA offers support, education, and advocacy for individuals with mood disorders. They aim to create inclusive spaces and equitable access to mental health resources for everyone.",
    image: "/resources/dbsa.png",
    link: "https://www.dbsalliance.org"
  },
  {
    title: "The Trevor Project (1-866-488-7386)",
    description: "The Trevor Project is a nonprofit focused on preventing suicide among LGBTQ+ youth and providing education and research on LGBTQ studies. Calling their number will connect with a counselor!",
    image: "/resources/trevor.png",
    link: "https://www.thetrevorproject.org"
  },
  {
    title: "Our Minds Matter",
    description: "Our Minds Matter aims to prevent teen suicide by providing mental health education, resources, and support. They are dedicated to empowering teens to take charge of their mental well-being and creating a supportive community.",
    image: "/resources/omm.png",
    link: "https://ourmindsmatter.org"
  },
  {
    title: "National Alliance on Mental Illness, NAMI Maryland (800-950-6264)",
    description: "NAMI is the largest grassroots mental health organization in the United States. It offers education, support and advocacy for individuals and families affected by mental illness.",
    image: "/resources/nami.jpg",
    link: "https://www.nami.org"
  },
  {
    title: "National Human Trafficking Hotline (1-888-373-7888)",
    description: "The National Human Trafficking Hotline is a confidential, 24/7 service that provides critical support to victims and survivors of human trafficking. It can also be used to report trafficking situations.",
    image: "/resources/hotline.png",
    link: "https://humantraffickinghotline.org"
  },
  {
    title: "SAFE Center for Human Trafficking Survivors",
    description: "University of Maryland SAFE Center provides trauma-informed services to empower survivors of human trafficking, while also conducting research and advocating for policy changes.",
    image: "/resources/safe.png",
    link: "https://umdsafecenter.org"
  },
  // {
  //   title: "Montgomery County Crisis Center (240-777-4000)",
  //   description: "The Montgomery County 24 Hour Crisis Center offers free mental health crisis evaluations and treatment referrals. They help prevent suicide and other crises.",
  //   image: require('../assets/images/resources/crisis.png'),
  //   link: "https://montgomerycountymd.gov/HHS-Program/Program.aspx?id=BHCS%2FBHCS24hrcrisiscenter-p204.html"
  // },
  {
    title: "Howard County LHIC",
    description: "The Local Health Improvement Coalition (LHIC) works to achieve health equity in Howard County. Participation is sought from individuals and organizations working to achieve optimal health and wellness for all Howard County residents.",
    image: "/resources/HCLHIC.png",
    link: "https://www.hclhic.org/healthy/mental-health"
  }
];

export default function Page() {
  return (
    <div className="relative flex flex-col justify-center gap-8 w-3/5 h-[75vh]">
      <h1 className="text-blue-500 font-extrabold text-[46px] leading-[1]">
        Mental health resources,<br/>curated for you.
      </h1>
      <div className="h-[63vh] overflow-scroll space-y-4">
        {
          resources.map((resource, index) => 
            <Resource title={resource.title} description={resource.description} pathToImage={resource.image} link={resource.link} key={index} />
          )
        }
      </div>
    </div>
  )
}