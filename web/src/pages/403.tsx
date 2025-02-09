import { useNavigate } from "react-router-dom";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { Button, Center, HStack } from "@chakra-ui/react";
import { t } from "i18next";

export default function Index() {
  const navigate = useNavigate();
  return (
    <div className=" bg-white h-screen">
      <Center h="80vh" w="80vw" className="flex-col !items-start m-auto">
        <h1 style={{ fontSize: 38 }}>403</h1>
        <p className="font-semibold mb-8" style={{ fontSize: 50 }}>
          {t(`403Message`)}
        </p>
        <HStack spacing={6}>
          <Button
            rightIcon={<ArrowForwardIcon />}
            size={"lg"}
            onClick={() => navigate("/", { replace: true })}
          >
            {t("Take me home")}
          </Button>
        </HStack>
      </Center>
    </div>
  );
}
