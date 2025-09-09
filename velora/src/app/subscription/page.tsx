import Sidebar from "@/components/sidebar";
import { SubscriptionSection as Section } from "@/components/subscription/section";
import { SubscriptionVideoRow as VideoRow } from "@/components/subscription/videorow";


const available = [
  {
    title: "Cooking Masterclass: The Art of Modern Cuisine",
    thumb:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAoJxTecPhE_PaHpo4ZMSRgsJyjjbygHj90EAayCOOo8Z61pIDLDKnANPpOPMRJmq9pRh3GMZuQ6uk1F3nKNawraJTtfehJfC_EZ7qgQX7ktNINJtTTaNVMIDSty3QfcJigHJbB3XiHQiekgePmLgzhWdD4qqrOg1SkYCaulR27KioxNtGqHocE0ZH5NdikY51LvDifBXYWb0FaNbVIWW5BUhX2AyI6Nya7Aw0kimRjnIV-d2QKl-v9HkNwdMBubIFjjRe9LfWk-bXH",
    subtext: "Available until July 15, 2024",
  },
  {
    title: "Full-Stack Web Development: From Concept to Launch",
    thumb:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDjFY2ZHtVpUqiwvgHNWf_hb1cG1dQana_i8GwQKa1QBoKygtoyfwjjljKZM--SZUB0hwv6UFxgqpY1UURE_snhhZ8g_TTt0QBSpaY0NidHyRYDofpmo2ih59zNKbcPSU9PSShVO76Pssu07jgsYmWAo0PD0VpucHHs6Op8Btj-AT21VRaDVyJpZ6HXac1a8J0XQ-jub9DFhXORyArxHMMPLYAjuoHas3JrKX-23W0py2zmJdT_II0FnuJk_Yx3VPlKAlRb7-or3EDY",
    subtext: "Available until July 20, 2024",
  },
];

const completed = [
  {
    title: "Portrait Photography: Capturing Your Subject’s Essence",
    thumb:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB4gb9STrJU3JCJendGpr2JPwGnwuh7zCBxeKKJLdsDI6FML7c9hdECdVn6y6Y9laurCNwxrpWamTAfEmyHJh2OayL9Eh4QGjpNhHgi7boo6OGbKeTTsB_Xy1EBFAepniY48pUe8O1tXLVGZB34E7uNV7Ns9NRUZLllWZEIs44VvKQt15w4sqIOoPswpoYkdpAP2q9Dj6_5lwP6020m_YFgxAl5uiv1Xddyr1oFeO2HSlLalbOOmC5jr4tivXNzPUn2PO5xpeJl2XbL",
    subtext: "Completed on June 1, 2024",
  },
  {
    title: "Ultimate Guide to Acoustic Guitar",
    thumb:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDkLd2ZMlvglYIOQVqbYQkEgGexTlopTzB61qQ04qdIANt70JBImC2uwmJ4Tp6C-0lKxFoMSHT7PrCTOkFSzMn0sTA75MwOhS4rptXW9TLjBeU3XxFL4GwSQPI0oGq_aNlJNlxY2Lcn13mUzHeJZitVejHDFfQRmk-gUra9eK_V0q78beFZ9Tvyo62oi78ZgyCAmx_DHri8teMApg24M2mYU_bofW9qZZ4WFCp4uuxWb-jvLbfeM2u9n9OKo-qa09ww5s5enLrCEWGl",
    subtext: "Completed on May 15, 2024",
  },
  {
    title: "Public Speaking: From Zero to Hero",
    thumb:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDsc6m5Oq7_fDQauvuY2ErAJ4dyBV1yQvyE42gwgyi2QkW-JMFj0cu0fj5vfhbOrKGg4O210RQakVU3waK9A2KjQywyGfsdkaKN3odJ8KxaLMDLOPXIIHrfOSyxy5lpmM41r216Wk6-5tzQ64t60YyK0HAdOluBJ8hsWSg3HNJCd3tOOfv5W8kl-l4gyfeo8KJUAmNhTe3IhT5nh3dL_F-smismYCx_oYvSvXOVBTd0KW7K78ram6hHRFBwnoT41ZzIZevoq91J0Og6",
    subtext: "Completed on April 1, 2024",
  },
];

export default function Subcription() {
  return (
    <div className="flex h-full grow flex-row">
      <Sidebar />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-neutral-50">Subscription Management</h1>

        <Section title="Available Videos" className="mt-6">
          {available.map((v) => (
            <VideoRow
              key={v.title}
              title={v.title}
              thumb={v.thumb}
              subtext={v.subtext}
              primaryAction={{ label: "Watch" }}
            />
          ))}
        </Section>

        <Section title="Completed Videos" className="mt-8">
          {completed.map((v) => (
            <VideoRow
              key={v.title}
              title={v.title}
              thumb={v.thumb}
              subtext={v.subtext}
              primaryAction={{ label: "Rewatch", variant: "secondary" }}
            />
          ))}
        </Section>
      </main>
    </div>
  );
}
